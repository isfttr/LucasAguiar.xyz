require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { callDeepSeek, callGemini, deepseekClient, geminiModel, isRateLimit } = require('./ai');
const { generateSlug, ensureUniqueSlug } = require('./slug');
const { PostHog } = require('posthog-node');

const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
  enableExceptionAutocapture: true,
});
const POSTHOG_DISTINCT_ID = 'translate-script';

if (!deepseekClient && !geminiModel) {
  console.error("Error: nenhum provedor de IA configurado (defina DEEPSEEK_API_KEY e/ou GEMINI_API_KEY em .env)");
  process.exit(1);
}
if (!deepseekClient) console.warn("DEEPSEEK_API_KEY ausente — usando apenas Gemini.");
if (!geminiModel) console.warn("GEMINI_API_KEY ausente — fallback indisponível.");

const EN_DIR = path.join(__dirname, '../content/en');
const PT_DIR = path.join(__dirname, '../content/pt');

function getHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isSameContent(a, b) {
  // Normalise whitespace before comparing to avoid false positives from
  // line-ending differences while still catching untranslated returns.
  const normalize = (s) => s.trim().replace(/\s+/g, ' ');
  return normalize(a) === normalize(b);
}

// Scalar front matter fields (title, description) are translated with the same
// body-oriented prompt, whose "preserve heading levels" rule makes the model
// sometimes treat a short standalone title as a heading and prefix it with
// "## ". Strip any leading markdown heading marker so it doesn't leak into YAML.
function stripHeadingPrefix(s) {
  return typeof s === 'string' ? s.replace(/^\s*#{1,6}\s+/, '').trim() : s;
}

// Single source of truth for how a post file is serialised, so metadata-only
// writes match exactly what translateFile() produces (no lineWidth wrapping).
function stringifyPost(content, data) {
  return matter.stringify(content, data, {
    engines: {
      yaml: {
        stringify: (obj) => yaml.dump(obj, { lineWidth: -1 })
      }
    }
  });
}

// Front matter fields that are language-neutral and must stay identical between
// a post and its translation. `draft` is the one that matters here: publishing
// the source (draft:false) must publish the translation too. Copied even when a
// post is too old to re-translate, since it's a cheap metadata write with no API
// call and no body changes. Localized fields (title/description/tags) are never
// touched.
const NEUTRAL_FM_FIELDS = ['draft'];

// Copy language-neutral front matter from `sourceData` onto the target file,
// preserving the target's body and its localized fields. When
// `sourceHashToStamp` is provided, also stamp it as the target's
// translation_source_hash to "adopt" a hand-authored pair so future source
// edits are picked up by the normal update-detection path. Returns true if the
// target file was changed.
function syncNeutralFrontMatter(sourceData, targetPath, sourceHashToStamp = null) {
  const targetParsed = matter(fs.readFileSync(targetPath, 'utf8'));
  const data = { ...targetParsed.data };
  let changed = false;

  for (const field of NEUTRAL_FM_FIELDS) {
    if (field in sourceData && data[field] !== sourceData[field]) {
      data[field] = sourceData[field];
      changed = true;
    }
  }
  if (sourceHashToStamp && data.translation_source_hash !== sourceHashToStamp) {
    data.translation_source_hash = sourceHashToStamp;
    changed = true;
  }
  if (!changed) return false;

  fs.writeFileSync(targetPath, stringifyPost(targetParsed.content, data), 'utf8');
  return true;
}

async function translateWithProvider(callFn, providerName, text, targetLang, retries = 5) {
  const prompt = `You are an expert technical translator for a Hugo blog.
Translate the following Markdown content to ${targetLang}.

STRICT RULES:
1. ONLY translate the natural language text.
2. DO NOT translate any Markdown syntax, URLs, or HTML tags.
3. DO NOT translate code blocks.
4. CRITICAL: DO NOT translate any Hugo shortcodes, especially {{< ref "..." >}}. Keep them exactly as they are.
5. Provide ONLY the translated text, without any markdown formatting wrappers like \`\`\`markdown around the whole output, and without any conversational filler.
6. CRITICAL: Preserve ALL Markdown heading levels exactly as they appear. A "## Heading" must remain "## " followed by the translated text. Never change heading depth (e.g., ## must not become # or ###).

Content to translate:
${text}`;

  for (let i = 0; i < retries; i++) {
    try {
      // Add a small delay between all requests to avoid hitting burst limits
      await sleep(2000);
      let output = await callFn(prompt);
      // Remove potential markdown wrappers the model might add
      if (output.startsWith('```markdown')) {
        output = output.replace(/^```markdown\n?/, '').replace(/\n?```$/, '');
      }
      // Guard against the model returning the original text unchanged, which
      // would silently write a "translated" file that is still in the source
      // language and then lock it via translation_source_hash.
      if (text.length > 50 && isSameContent(output, text)) {
        console.warn(`[${providerName}] Translation returned identical content (attempt ${i + 1}/${retries}), retrying...`);
        await sleep(5000);
        continue;
      }
      return output;
    } catch (e) {
      const rateLimited = isRateLimit(e);
      let delayMs = Math.min(5000 * (i + 1), 30000); // exponential-ish backoff for generic errors

      if (rateLimited) {
        delayMs = 30000;
        const match = e.message && e.message.match(/retry in (\d+(\.\d+)?)s/);
        if (match) {
          delayMs = (parseFloat(match[1]) + 5) * 1000;
        }
        console.warn(`[${providerName}] Rate limit hit (429). Waiting ${delayMs/1000}s before retry ${i + 1}/${retries}...`);
        posthog.capture({
          distinctId: POSTHOG_DISTINCT_ID,
          event: 'translation_rate_limit_hit',
          properties: { provider: providerName, retry_count: i + 1, wait_ms: delayMs },
        });
      } else {
        console.warn(`[${providerName}] Translation error (attempt ${i + 1}/${retries}): ${e.message}. Retrying in ${delayMs/1000}s...`);
      }
      await sleep(delayMs);
    }
  }
  console.error(`[${providerName}] Max retries reached for translation.`);
  posthog.capture({
    distinctId: POSTHOG_DISTINCT_ID,
    event: 'translation_failed',
    properties: { provider: providerName, retries },
  });
  return null;
}

// DeepSeek is the primary provider; fall back to Gemini for this specific call if
// DeepSeek exhausts its retries (API error, persistent rate-limit, or identical output).
async function translateContent(text, targetLang) {
  let out = deepseekClient ? await translateWithProvider(callDeepSeek, 'deepseek', text, targetLang) : null;
  if (out === null && geminiModel) {
    console.warn('DeepSeek falhou; caindo para Gemini...');
    posthog.capture({
      distinctId: POSTHOG_DISTINCT_ID,
      event: 'translation_provider_fallback',
      properties: { from: 'deepseek', to: 'gemini' },
    });
    out = await translateWithProvider(callGemini, 'gemini', text, targetLang);
  }
  return out;
}

// Collect the effective slugs already used by other posts in a language
// directory (front matter `slug`, or the filename when absent) so a generated
// slug can be de-duplicated against them. Excludes `excludePath` (the target
// file itself when re-translating an existing post).
function collectExistingSlugs(dir, excludePath) {
  const set = new Set();
  if (!fs.existsSync(dir)) return set;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md') || file === '_index.md') continue;
    const full = path.join(dir, file);
    if (excludePath && path.resolve(full) === path.resolve(excludePath)) continue;
    try {
      const { data } = matter(fs.readFileSync(full, 'utf8'));
      set.add(data.slug || file.replace(/\.md$/, ''));
    } catch { /* ignore unreadable file */ }
  }
  return set;
}

async function translateFile(sourcePath, targetPath, targetLang) {
  console.log(`Translating: ${sourcePath} -> ${targetLang}`);
  
  const rawSource = fs.readFileSync(sourcePath, 'utf8');
  const sourceHash = getHash(rawSource);
  
  // Parse frontmatter
  const parsed = matter(rawSource);
  const data = { ...parsed.data };
  const body = parsed.content;

  // Translate Front Matter fields
  if (data.title) {
    data.title = stripHeadingPrefix(await translateContent(data.title, targetLang));
  }
  if (data.description) {
    data.description = stripHeadingPrefix(await translateContent(data.description, targetLang));
  }

  // Generate a slug in the target language so the translated post gets a
  // native-language URL, even though it keeps the source's filename (the shared
  // filename stays the cross-language translation key that Hugo's .Translations
  // and the backlinks relrefs rely on). Overwrites any slug inherited from the
  // source, which would otherwise be in the source language.
  if (data.title) {
    const year = data.date ? new Date(data.date).getFullYear() : new Date().getFullYear();
    const existingSlugs = collectExistingSlugs(path.dirname(targetPath), targetPath);
    data.slug = ensureUniqueSlug(await generateSlug(data.title, targetLang), existingSlugs, year);
  }

  // Aliases inherited from the source point at the source language's old URLs
  // and would be wrong for a post with a different slug — drop them on the target.
  if ('aliases' in data) delete data.aliases;

  // Translate Body
  let translatedBody = body;
  if (body.trim().length > 0) {
    translatedBody = await translateContent(body, targetLang);
    if (!translatedBody) {
      console.log(`Skipped ${sourcePath} due to translation error.`);
      return;
    }
  }

  // Add the hash of the source file to avoid infinite loops and detect updates
  data.translation_source_hash = sourceHash;

  // Reconstruct file
  const newRawContent = stringifyPost(translatedBody, data);
  
  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, newRawContent, 'utf8');
  console.log(`Successfully created: ${targetPath}`);
  posthog.capture({
    distinctId: POSTHOG_DISTINCT_ID,
    event: 'translation_file_translated',
    properties: {
      source_path: sourcePath,
      target_path: targetPath,
      target_lang: targetLang,
    },
  });
}

async function syncDirectories() {
  const allEnFiles = getAllFiles(EN_DIR);
  const allPtFiles = getAllFiles(PT_DIR);

  const fileMap = new Map();

  allEnFiles.forEach(f => {
    const rel = path.relative(EN_DIR, f);
    if (!fileMap.has(rel)) fileMap.set(rel, { en: f, pt: null });
    else fileMap.get(rel).en = f;
  });

  allPtFiles.forEach(f => {
    const rel = path.relative(PT_DIR, f);
    if (!fileMap.has(rel)) fileMap.set(rel, { en: null, pt: f });
    else fileMap.get(rel).pt = f;
  });

  let translatedCount = 0;
  const MAX_TRANSLATIONS = 5;

  // Separate missing-file entries (priority) from update entries
  const missing = [];
  const updates = [];

  for (const [relPath, files] of fileMap.entries()) {
    if (!relPath.endsWith('.md')) continue;
    if (!files.en || !files.pt) {
      missing.push([relPath, files]);
    } else {
      updates.push([relPath, files]);
    }
  }

  for (const group of [missing, updates]) {
    for (const [relPath, files] of group) {
      if (translatedCount >= MAX_TRANSLATIONS) {
        console.log(`Reached maximum translations limit (${MAX_TRANSLATIONS}) for this run.`);
        break;
      }

      const enPath = files.en;
      const ptPath = files.pt;

      let didTranslate = false;

      if (enPath && !ptPath) {
        // Missing in PT
        if (!isRecentPost(enPath)) {
          console.log(`Skipped (too old): ${relPath}`);
        } else {
          await translateFile(enPath, path.join(PT_DIR, relPath), 'Portuguese');
          didTranslate = true;
        }
      } else if (ptPath && !enPath) {
        // Missing in EN
        if (!isRecentPost(ptPath)) {
          console.log(`Skipped (too old): ${relPath}`);
        } else {
          await translateFile(ptPath, path.join(EN_DIR, relPath), 'English');
          didTranslate = true;
        }
      } else if (enPath && ptPath) {
        // Both exist, check for updates
        const enRaw = fs.readFileSync(enPath, 'utf8');
        const ptRaw = fs.readFileSync(ptPath, 'utf8');

        const enParsed = matter(enRaw);
        const ptParsed = matter(ptRaw);

        const enHash = getHash(enRaw);
        const ptHash = getHash(ptRaw);

        // If PT was translated from EN, and EN has changed
        if (ptParsed.data.translation_source_hash && ptParsed.data.translation_source_hash !== enHash) {
          if (!isRecentPost(enPath)) {
            // Too old to re-translate the body, but still propagate the
            // language-neutral `draft` flag so publishing EN publishes PT.
            if (syncNeutralFrontMatter(enParsed.data, ptPath)) {
              console.log(`Synced draft EN->PT (too old to re-translate): ${relPath}`);
            } else {
              console.log(`Skipped (too old): ${relPath}`);
            }
          } else {
            console.log(`Update detected in EN: ${relPath}`);
            await translateFile(enPath, ptPath, 'Portuguese');
            didTranslate = true;
          }
        }
        // If EN was translated from PT, and PT has changed
        else if (enParsed.data.translation_source_hash && enParsed.data.translation_source_hash !== ptHash) {
          if (!isRecentPost(ptPath)) {
            if (syncNeutralFrontMatter(ptParsed.data, enPath)) {
              console.log(`Synced draft PT->EN (too old to re-translate): ${relPath}`);
            } else {
              console.log(`Skipped (too old): ${relPath}`);
            }
          } else {
            console.log(`Update detected in PT: ${relPath}`);
            await translateFile(ptPath, enPath, 'English');
            didTranslate = true;
          }
        }
        // Neither side has a translation_source_hash: a hand-authored pair the
        // checks above can't link (e.g. PT and EN committed together). Treat PT
        // as the canonical source — sync `draft` PT->EN so publishing the PT
        // publishes the EN, and stamp the source hash to adopt the pair so
        // future PT edits flow through the normal update path above. The body is
        // left untouched to preserve hand-written EN content.
        else if (!ptParsed.data.translation_source_hash && !enParsed.data.translation_source_hash) {
          if (syncNeutralFrontMatter(ptParsed.data, enPath, ptHash)) {
            console.log(`Adopted orphan pair + synced draft PT->EN: ${relPath}`);
          }
        }
      }

      if (didTranslate) {
        translatedCount++;
      }
    }
  }
}

function isRecentPost(filePath, maxAgeDays = 2) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(raw);
  if (!data.date) return false;
  const postDate = new Date(data.date);
  const now = new Date();
  const diffDays = (now - postDate) / (1000 * 60 * 60 * 24);
  return diffDays <= maxAgeDays;
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

if (require.main === module) {
  syncDirectories().then(async () => {
    console.log("Translation sync complete.");
    posthog.capture({ distinctId: POSTHOG_DISTINCT_ID, event: 'translation_sync_completed' });
    await posthog.shutdown();
  }).catch(async (err) => {
    posthog.captureException(err, POSTHOG_DISTINCT_ID);
    await posthog.shutdown();
    console.error(err);
  });
}

module.exports = { syncNeutralFrontMatter, stringifyPost, NEUTRAL_FM_FIELDS };
