require('dotenv').config();
const { callDeepSeek, callGemini, deepseekClient, geminiModel, isRateLimit } = require('./ai');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_SLUG_WORDS = 8;
const MAX_SLUG_CHARS = 70;

// Deterministic slugify: strip diacritics, lowercase, hyphenate, truncate.
// Used both to sanitize LLM output and as the offline fallback.
function slugify(str, { maxWords = MAX_SLUG_WORDS, maxChars = MAX_SLUG_CHARS } = {}) {
  if (!str) return '';
  let s = String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics (á -> a)
    .toLowerCase()
    .replace(/['’`´]/g, '')          // drop apostrophes so "anthropic's" -> "anthropics"
    .replace(/[^a-z0-9]+/g, '-')     // any run of non-alphanumerics -> single hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
  if (!s) return '';
  s = s.split('-').filter(Boolean).slice(0, maxWords).join('-');
  if (s.length > maxChars) {
    // trim to maxChars without cutting a word in half
    s = s.slice(0, maxChars).replace(/-[^-]*$/, '').replace(/-+$/, '');
  }
  return s;
}

// Try DeepSeek (primary) then Gemini (fallback) for an arbitrary prompt.
// Mirrors the retry/rate-limit handling of translate.js but without the
// "identical content" guard (irrelevant for slug generation). Returns the raw
// trimmed model output, or null if every provider/attempt failed.
async function callWithFallback(prompt, retries = 3) {
  const providers = [];
  if (deepseekClient) providers.push(['deepseek', callDeepSeek]);
  if (geminiModel) providers.push(['gemini', callGemini]);

  for (const [name, fn] of providers) {
    for (let i = 0; i < retries; i++) {
      try {
        await sleep(1500);
        const out = await fn(prompt);
        if (out && out.trim()) return out.trim();
      } catch (e) {
        const delayMs = isRateLimit(e) ? 30000 : Math.min(5000 * (i + 1), 20000);
        console.warn(`[slug/${name}] erro (tentativa ${i + 1}/${retries}): ${e.message}. Aguardando ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }
  }
  return null;
}

// Ask the model for a concise, SEO-friendly URL slug in `targetLang`
// ('English' | 'Portuguese'), sanitize it through slugify(), and fall back to
// slugify(title) if the LLM is unavailable or returns junk.
async function generateSlug(title, targetLang) {
  const fallback = slugify(title);
  if (!title) return fallback;

  const prompt = `Generate a concise, SEO-friendly URL slug in ${targetLang} for the following blog post title.
RULES:
- lowercase ASCII only, no accents, words separated by single hyphens
- 3 to 7 words, keep the most important keywords, drop filler words (articles, prepositions)
- no punctuation, no quotes, no surrounding text
- Return ONLY the slug on a single line, nothing else.

Title: ${title}`;

  const raw = await callWithFallback(prompt);
  const cleaned = slugify(raw || '');
  return cleaned || fallback;
}

// Avoid URL collisions within a single language directory: if `slug` is already
// taken, append the post's year, then -2, -3... until free.
function ensureUniqueSlug(slug, takenSet, dateYear) {
  if (!slug || !takenSet || !takenSet.has(slug)) return slug;
  if (dateYear) {
    const withYear = `${slug}-${dateYear}`;
    if (!takenSet.has(withYear)) return withYear;
  }
  let n = 2;
  let candidate = `${slug}-${n}`;
  while (takenSet.has(candidate)) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}

module.exports = { slugify, generateSlug, ensureUniqueSlug, callWithFallback };
