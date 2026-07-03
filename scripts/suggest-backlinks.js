require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');
const { callDeepSeek, callGemini, deepseekClient, geminiModel, isRateLimit } = require('./ai');
const { PostHog } = require('posthog-node');

const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST,
  flushAt: 1,
  flushInterval: 0,
  enableExceptionAutocapture: true,
});
const POSTHOG_DISTINCT_ID = 'suggest-backlinks-script';

if (!deepseekClient && !geminiModel) {
  console.error('Error: nenhum provedor de IA configurado (defina DEEPSEEK_API_KEY e/ou GEMINI_API_KEY em .env)');
  process.exit(1);
}
if (!deepseekClient) console.warn('DEEPSEEK_API_KEY ausente — usando apenas Gemini.');
if (!geminiModel) console.warn('GEMINI_API_KEY ausente — fallback indisponível.');

const EN_DIR = path.join(__dirname, '../content/en/posts');
const PT_DIR = path.join(__dirname, '../content/pt/posts');
const INDEX_PATH = path.join(__dirname, 'posts-index.json');

const MIN_BACKLINKS = 3;
const MAX_AI_CALLS = 10;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Returns the character index where frontmatter ends (after closing ---)
function frontmatterEnd(raw) {
  const match = raw.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? match[0].length : 0;
}

function hasBacklinksHeader(body) {
  return /(?:Leia também|Read also)\s*:/i.test(body);
}

// Extracts slugs from existing "Read also / Leia também" section
function extractBacklinkSlugs(body) {
  const slugs = [];
  const re = /\{\{<\s*relref\s+"posts\/([^"/]+)\/?"\s*>\}\}/g;
  let m;
  while ((m = re.exec(body)) !== null) slugs.push(m[1]);
  return slugs;
}

function buildSection(slugs, allPosts, lang) {
  const header = lang === 'pt' ? 'Leia também' : 'Read also';
  const lines = slugs.map((slug) => {
    const post = allPosts[slug];
    const title =
      lang === 'pt' ? post?.title_pt || post?.title_en || slug : post?.title_en || slug;
    return `- [${title}]({{< relref "posts/${slug}/" >}})`;
  });
  return `${header}:\n\n${lines.join('\n')}`;
}

function applyBacklinksToFile(filePath, slugs, allPosts, lang) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmEnd = frontmatterEnd(raw);
  const fm = raw.slice(0, fmEnd);
  let body = raw.slice(fmEnd);

  const section = buildSection(slugs, allPosts, lang);

  if (hasBacklinksHeader(body)) {
    // Replace existing section (header + list items)
    body = body.replace(
      /((?:Leia também|Read also)\s*:\n+(?:- \[[\s\S]*?\]\([\s\S]*?\)\n?)+)/i,
      section + '\n'
    );
  } else {
    // Insert before last --- separator, or append
    const lastSep = body.lastIndexOf('\n---');
    if (lastSep !== -1) {
      body = body.slice(0, lastSep) + '\n\n' + section + '\n' + body.slice(lastSep);
    } else {
      body = body.trimEnd() + '\n\n' + section + '\n';
    }
  }

  fs.writeFileSync(filePath, fm + body, 'utf8');
}

async function suggestWithProvider(callFn, providerName, targetSlug, targetPost, allPosts, retries = 5) {
  const candidates = Object.values(allPosts)
    .filter((p) => p.slug !== targetSlug)
    .map((p) => ({
      slug: p.slug,
      title: p.title_en || p.title_pt,
      tags: p.tags,
      categories: p.categories,
      description: p.description_en || p.description_pt || '',
    }));

  const prompt = `You manage a technical blog. Your task is to find the 3 most thematically related posts for a given post.

TARGET POST:
slug: ${targetSlug}
title: ${targetPost.title_en || targetPost.title_pt}
tags: ${JSON.stringify(targetPost.tags)}
categories: ${JSON.stringify(targetPost.categories)}
description: ${targetPost.description_en || targetPost.description_pt || ''}

CANDIDATE POSTS:
${JSON.stringify(candidates, null, 2)}

Return ONLY a JSON array of exactly 3 slugs from the candidate list, ordered by relevance (most relevant first). No explanation, no markdown fences, no extra text.
Example: ["slug-a","slug-b","slug-c"]`;

  for (let i = 0; i < retries; i++) {
    try {
      await sleep(2000);
      let output = (await callFn(prompt)).trim();
      // Strip potential markdown fences
      output = output.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      const parsed = JSON.parse(output);
      if (
        Array.isArray(parsed) &&
        parsed.length === 3 &&
        parsed.every((s) => typeof s === 'string' && allPosts[s])
      ) {
        return parsed;
      }
      console.warn(`[${providerName}] Invalid response for ${targetSlug}: ${output}`);
      return null;
    } catch (e) {
      if (isRateLimit(e)) {
        let delayMs = 30000;
        const match = e.message && e.message.match(/retry in (\d+(\.\d+)?)s/);
        if (match) delayMs = (parseFloat(match[1]) + 5) * 1000;
        console.warn(`[${providerName}] Rate limit hit. Waiting ${delayMs / 1000}s before retry ${i + 1}/${retries}...`);
        await sleep(delayMs);
      } else {
        console.error(`[${providerName}] AI call failed for ${targetSlug}: ${e.message}`);
        posthog.captureException(e, POSTHOG_DISTINCT_ID);
        return null;
      }
    }
  }
  return null;
}

// DeepSeek is the primary provider; fall back to Gemini for this slug if DeepSeek
// returns null (API error, persistent rate-limit, or an invalid/unparseable response).
async function suggestBacklinks(targetSlug, targetPost, allPosts) {
  let out = deepseekClient
    ? await suggestWithProvider(callDeepSeek, 'deepseek', targetSlug, targetPost, allPosts)
    : null;
  if (out === null && geminiModel) {
    console.warn(`DeepSeek falhou para ${targetSlug}; caindo para Gemini...`);
    posthog.capture({
      distinctId: POSTHOG_DISTINCT_ID,
      event: 'backlinks_provider_fallback',
      properties: { slug: targetSlug, from: 'deepseek', to: 'gemini' },
    });
    out = await suggestWithProvider(callGemini, 'gemini', targetSlug, targetPost, allPosts);
  }
  return out;
}

function loadIndex() {
  if (fs.existsSync(INDEX_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    } catch {
      return { last_updated: null, posts: {} };
    }
  }
  return { last_updated: null, posts: {} };
}

function saveIndex(index) {
  index.last_updated = new Date().toISOString();
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n', 'utf8');
}

// PHASE 1+2: Scan EN posts and build/update index
function scanPosts(index) {
  const files = fs.readdirSync(EN_DIR).filter((f) => f.endsWith('.md') && f !== '_index.md');

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const enPath = path.join(EN_DIR, file);
    const ptPath = path.join(PT_DIR, file);

    const enRaw = fs.readFileSync(enPath, 'utf8');
    const enParsed = matter(enRaw);
    const enHash = getHash(enRaw);

    const prev = index.posts[slug] || {};
    const hashChanged = prev.content_hash_en !== enHash;

    // Extract titles from both language files
    let titlePt = prev.title_pt || enParsed.data.title || slug;
    if (fs.existsSync(ptPath)) {
      const ptParsed = matter(fs.readFileSync(ptPath, 'utf8'));
      titlePt = ptParsed.data.title || titlePt;
    }

    // Detect existing backlinks from file content (for bootstrapping)
    const fmEnd = frontmatterEnd(enRaw);
    const body = enRaw.slice(fmEnd);
    const fromFile = extractBacklinkSlugs(body);

    let backlinks = prev.backlinks || [];
    let backlinkSource = prev.backlink_source || 'none';

    if (fromFile.length >= MIN_BACKLINKS) {
      backlinks = fromFile.slice(0, MIN_BACKLINKS);
      backlinkSource = 'file';
    } else if (hashChanged || backlinks.length < MIN_BACKLINKS) {
      // Will need AI — mark as pending unless we already have enough from index
      if (prev.backlinks && prev.backlinks.length >= MIN_BACKLINKS && !hashChanged) {
        backlinks = prev.backlinks;
        backlinkSource = prev.backlink_source || 'ai';
      } else {
        backlinks = fromFile; // keep what we found
        backlinkSource = 'pending';
      }
    }

    index.posts[slug] = {
      slug,
      title_en: enParsed.data.title || slug,
      title_pt: titlePt,
      tags: enParsed.data.tags || [],
      categories: enParsed.data.categories || [],
      description_en: enParsed.data.description || '',
      content_hash_en: enHash,
      backlinks,
      backlink_source: backlinkSource,
      last_processed: prev.last_processed || null,
    };
  }

  // Second pass: detect PT-only posts (no EN equivalent yet)
  const ptFiles = fs.readdirSync(PT_DIR).filter((f) => f.endsWith('.md') && f !== '_index.md');
  for (const file of ptFiles) {
    const slug = file.replace(/\.md$/, '');
    if (index.posts[slug]) continue; // already handled by EN scan

    const ptPath = path.join(PT_DIR, file);
    const ptRaw = fs.readFileSync(ptPath, 'utf8');
    const ptParsed = matter(ptRaw);
    const ptHash = getHash(ptRaw);

    const prev = index.posts[slug] || {};
    const hashChanged = prev.content_hash_pt !== ptHash;

    const fmEnd = frontmatterEnd(ptRaw);
    const body = ptRaw.slice(fmEnd);
    const fromFile = extractBacklinkSlugs(body);

    let backlinks = prev.backlinks || [];
    let backlinkSource = prev.backlink_source || 'none';

    if (fromFile.length >= MIN_BACKLINKS) {
      backlinks = fromFile.slice(0, MIN_BACKLINKS);
      backlinkSource = 'file';
    } else if (hashChanged || backlinks.length < MIN_BACKLINKS) {
      if (prev.backlinks && prev.backlinks.length >= MIN_BACKLINKS && !hashChanged) {
        backlinks = prev.backlinks;
        backlinkSource = prev.backlink_source || 'ai';
      } else {
        backlinks = fromFile;
        backlinkSource = 'pending';
      }
    }

    index.posts[slug] = {
      slug,
      title_en: prev.title_en || ptParsed.data.title || slug,
      title_pt: ptParsed.data.title || slug,
      tags: ptParsed.data.tags || [],
      categories: ptParsed.data.categories || [],
      description_en: prev.description_en || ptParsed.data.description || '',
      content_hash_en: null,
      content_hash_pt: ptHash,
      backlinks,
      backlink_source: backlinkSource,
      last_processed: prev.last_processed || null,
    };
  }

  return index;
}

async function run() {
  console.log('=== suggest-backlinks: starting ===');

  const index = loadIndex();
  const updatedIndex = scanPosts(index);
  saveIndex(updatedIndex);
  console.log(`Scanned ${Object.keys(updatedIndex.posts).length} posts.`);

  // PHASE 3: AI matching for posts that need backlinks
  const pending = Object.values(updatedIndex.posts).filter(
    (p) => p.backlink_source === 'pending' || p.backlinks.length < MIN_BACKLINKS
  );
  console.log(`Posts needing backlink suggestions: ${pending.length}`);

  let aiCallCount = 0;
  for (const post of pending) {
    if (aiCallCount >= MAX_AI_CALLS) {
      console.log(`Reached AI call limit (${MAX_AI_CALLS}) for this run.`);
      break;
    }

    console.log(`Requesting backlinks for: ${post.slug}`);
    const suggested = await suggestBacklinks(post.slug, post, updatedIndex.posts);
    if (suggested) {
      updatedIndex.posts[post.slug].backlinks = suggested;
      updatedIndex.posts[post.slug].backlink_source = 'ai';
      updatedIndex.posts[post.slug].last_processed = new Date().toISOString();
      posthog.capture({
        distinctId: POSTHOG_DISTINCT_ID,
        event: 'backlinks_suggested',
        properties: { slug: post.slug, backlinks: suggested },
      });
    }
    aiCallCount++;
  }

  saveIndex(updatedIndex);

  // PHASE 4: Apply backlinks to files
  let filesChanged = 0;
  for (const post of Object.values(updatedIndex.posts)) {
    if (post.backlinks.length < MIN_BACKLINKS) {
      console.log(`Skipping ${post.slug} — not enough backlinks (${post.backlinks.length})`);
      continue;
    }

    const enPath = path.join(EN_DIR, `${post.slug}.md`);
    const ptPath = path.join(PT_DIR, `${post.slug}.md`);

    if (fs.existsSync(enPath)) {
      applyBacklinksToFile(enPath, post.backlinks, updatedIndex.posts, 'en');
      filesChanged++;
    }
    if (fs.existsSync(ptPath)) {
      applyBacklinksToFile(ptPath, post.backlinks, updatedIndex.posts, 'pt');
      filesChanged++;
    }
  }

  console.log(`Applied backlinks to ${filesChanged} files.`);
  posthog.capture({
    distinctId: POSTHOG_DISTINCT_ID,
    event: 'backlinks_sync_completed',
    properties: { files_changed: filesChanged, ai_calls: aiCallCount },
  });
}

run()
  .then(async () => {
    console.log('=== suggest-backlinks: done ===');
    await posthog.shutdown();
  })
  .catch(async (err) => {
    console.error(err);
    posthog.captureException(err, POSTHOG_DISTINCT_ID);
    await posthog.shutdown();
    process.exit(1);
  });
