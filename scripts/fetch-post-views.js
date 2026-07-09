require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Coleta contagens de pageview do PostHog (Query API / HogQL) e grava
// data/post_views.json, consumido pelo template da home para ranquear posts por
// popularidade (score = views + recência) e para a seção "Mais lidos (7 dias)".
//
// RESILIÊNCIA: qualquer falha (chave ausente, erro de rede, resposta vazia) apenas
// gera um JSON válido porém vazio e sai com código 0 — nunca quebra o build do Hugo.
// Sem dados, a home cai no fallback cronológico e a lateral some.

// Chave dedicada só de leitura de query (escopo query:read), separada da
// POSTHOG_PERSONAL_API_KEY usada pelas anotações.
const QUERY_API_KEY = process.env.POSTHOG_QUERY_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '404499';
// Query API do PostHog US (app host), distinto do host de ingestão us.i.posthog.com.
const API_HOST = process.env.POSTHOG_API_HOST || 'https://us.posthog.com';

// Janela do score. 0 (ou vazio) = "desde sempre" (limitado a ~10 anos por segurança).
const VIEWS_WINDOW_DAYS = parseInt(process.env.VIEWS_WINDOW_DAYS || '0', 10) || 0;
const SCORE_INTERVAL_DAYS = VIEWS_WINDOW_DAYS > 0 ? VIEWS_WINDOW_DAYS : 3650;
const TRENDING_WINDOW_DAYS = parseInt(process.env.TRENDING_WINDOW_DAYS || '7', 10) || 7;
const TRENDING_LIMIT = parseInt(process.env.TRENDING_LIMIT || '10', 10) || 10;

const OUT_PATH = path.join(__dirname, '..', 'data', 'post_views.json');

// HogQL: pageviews por pathname, excluindo bots. LIKE '%/posts/%' pega EN (/posts/),
// PT (/pt/posts/) e o legado EN (/en/posts/).
function pageviewSql(intervalDays, limit) {
  return `SELECT properties.$pathname AS pathname, count() AS views
FROM events
WHERE event = '$pageview'
  AND timestamp >= now() - INTERVAL ${intervalDays} DAY
  AND properties.$pathname LIKE '%/posts/%'
  AND NOT coalesce(properties.$virt_is_bot, false)
GROUP BY pathname
ORDER BY views DESC
LIMIT ${limit}`;
}

async function runHogQL(sql) {
  const url = `${API_HOST}/api/projects/${PROJECT_ID}/query/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${QUERY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${detail.slice(0, 300)}`);
  }
  const json = await res.json();
  // results: [[pathname, views], ...]
  return Array.isArray(json.results) ? json.results : [];
}

// Normaliza um pathname do PostHog para casar com o .RelPermalink do Hugo:
// - garante barra inicial e final;
// - remove query/hash (defensivo — $pathname já não os tem);
// - dobra o prefixo legado /en/ no default (/), pois é o mesmo post EN.
// Retorna null para páginas de índice/paginação, que não são posts.
function normalizePath(raw) {
  if (!raw) return null;
  let p = String(raw).split('#')[0].split('?')[0].trim();
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.endsWith('/')) p = p + '/';
  if (p.startsWith('/en/')) p = p.slice(3); // '/en/posts/x/' -> '/posts/x/'
  if (p.includes('/page/')) return null; // paginação
  // páginas de seção (listagem), não posts individuais
  if (p === '/posts/' || p === '/pt/posts/') return null;
  // precisa ter um slug depois de posts/
  if (!/\/posts\/[^/]+\//.test(p)) return null;
  return p;
}

function langOf(normalizedPath) {
  return normalizedPath.startsWith('/pt/') ? 'pt' : 'en';
}

// Soma views por pathname normalizado (funde /en/ com /).
function foldRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const p = normalizePath(row[0]);
    if (!p) continue;
    const views = Number(row[1]) || 0;
    map.set(p, (map.get(p) || 0) + views);
  }
  return map;
}

function emptyPayload() {
  return {
    generated_at: new Date().toISOString(),
    window_days: VIEWS_WINDOW_DAYS,
    posts: {},
    trending_7d: { en: [], pt: [] },
  };
}

function writePayload(payload) {
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
}

async function main() {
  if (!QUERY_API_KEY) {
    console.warn('[fetch-post-views] POSTHOG_QUERY_API_KEY ausente — gravando post_views.json vazio (fallback cronológico).');
    writePayload(emptyPayload());
    return;
  }

  // Score (all-time): mapa pathname -> views totais.
  const scoreMap = foldRows(await runHogQL(pageviewSql(SCORE_INTERVAL_DAYS, 1000)));

  // Trending (7 dias): top N por idioma.
  const trendingMap = foldRows(await runHogQL(pageviewSql(TRENDING_WINDOW_DAYS, 300)));
  const trending = { en: [], pt: [] };
  const ordered = [...trendingMap.entries()].sort((a, b) => b[1] - a[1]);
  for (const [p, views] of ordered) {
    const lang = langOf(p);
    if (trending[lang].length < TRENDING_LIMIT) trending[lang].push({ path: p, views });
  }

  const payload = {
    generated_at: new Date().toISOString(),
    window_days: VIEWS_WINDOW_DAYS,
    posts: Object.fromEntries(scoreMap),
    trending_7d: trending,
  };
  writePayload(payload);
  console.log(
    `[fetch-post-views] OK — ${scoreMap.size} posts (score), ` +
      `trending 7d: ${trending.en.length} EN / ${trending.pt.length} PT → ${OUT_PATH}`
  );
}

main().catch((err) => {
  // Nunca derrubar o build: loga e grava JSON vazio.
  console.warn(`[fetch-post-views] falha ao consultar o PostHog: ${err.message}`);
  try {
    writePayload(emptyPayload());
  } catch (e) {
    console.warn(`[fetch-post-views] não foi possível gravar o arquivo vazio: ${e.message}`);
  }
  process.exit(0);
});
