require('dotenv').config();
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { generateSlug, ensureUniqueSlug } = require('./slug');
const { stringifyPost } = require('./translate');

// One-time migration: give already-published English posts an English URL slug
// while preserving their current URL via `aliases` (so no 404 / lost SEO). Posts
// keep their filename — the shared filename remains the translation key that
// links PT/EN and that suggest-backlinks + relref rely on. Idempotent: a post
// whose slug already matches the generated English slug is left untouched.
//
// Run `node scripts/backfill-en-slugs.js --dry-run` first and review the diff;
// LLM-generated slugs are non-deterministic, so eyeball the result before commit.

const EN_DIR = path.join(__dirname, '../content/en/posts');
const DRY_RUN = process.argv.includes('--dry-run');

// Effective current URL for a post (Hugo precedence: url > slug > filename),
// normalized to a leading/trailing-slashed path to use as an alias.
function currentUrl(data, filenameBase) {
  if (data.url) {
    let u = String(data.url).trim();
    if (!u.startsWith('/')) u = `/${u}`;
    if (!u.endsWith('/')) u = `${u}/`;
    return u;
  }
  const slug = data.slug || filenameBase;
  return `/posts/${slug}/`;
}

function toAliasArray(aliases) {
  if (!aliases) return [];
  return Array.isArray(aliases) ? aliases.slice() : [aliases];
}

async function run() {
  const files = fs
    .readdirSync(EN_DIR)
    .filter((f) => f.endsWith('.md') && f !== '_index.md');

  // Pre-scan so we can de-duplicate generated slugs across the whole directory.
  const posts = files.map((file) => {
    const full = path.join(EN_DIR, file);
    const parsed = matter(fs.readFileSync(full, 'utf8'));
    const base = file.replace(/\.md$/, '');
    return { file, full, parsed, base, currentSlug: parsed.data.slug || base };
  });
  const taken = new Set(posts.map((p) => p.currentSlug));

  let changed = 0;
  for (const { file, full, parsed, base, currentSlug } of posts) {
    const data = { ...parsed.data };

    if (!data.title) {
      console.log(`skip (sem title): ${file}`);
      continue;
    }
    if (data.url) {
      // Explicit `url:` is an intentional fixed permalink — leave it alone.
      console.log(`skip (url: fixo): ${file}`);
      continue;
    }

    const oldUrl = currentUrl(data, base);
    const year = data.date ? new Date(data.date).getFullYear() : undefined;

    let candidate = await generateSlug(data.title, 'English');
    if (!candidate || candidate === currentSlug) {
      console.log(`skip (slug já em inglês): ${file} -> ${currentSlug}`);
      continue;
    }
    // De-duplicate against every other post's slug (exclude our own current one).
    const others = new Set(taken);
    others.delete(currentSlug);
    candidate = ensureUniqueSlug(candidate, others, year);

    data.slug = candidate;
    const aliases = new Set(toAliasArray(data.aliases));
    aliases.add(oldUrl);
    data.aliases = [...aliases];

    taken.delete(currentSlug);
    taken.add(candidate);

    console.log(`${DRY_RUN ? '[dry] ' : ''}${file}: slug -> ${candidate}  (alias ${oldUrl})`);
    if (!DRY_RUN) fs.writeFileSync(full, stringifyPost(parsed.content, data), 'utf8');
    changed++;
  }

  console.log(`${DRY_RUN ? '[dry] ' : ''}${changed} arquivo(s) ${DRY_RUN ? 'seriam alterados' : 'alterados'}.`);
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run };
