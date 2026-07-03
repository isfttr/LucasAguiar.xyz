require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const matter = require('gray-matter');

// Cria uma anotação no PostHog toda vez que um post "fica público" num push
// (draft: true -> false, ou arquivo novo já com draft: false). Comparamos a
// versão do arquivo antes e depois do push para detectar apenas a transição para
// público, ignorando edições de posts que já estavam no ar.

const PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '404499';
const API_HOST = process.env.POSTHOG_API_HOST || 'https://us.i.posthog.com';

// git rev-parse do range do push. No CI vêm de github.event.before / github.sha.
const AFTER_SHA = process.env.AFTER_SHA || 'HEAD';
// SHA "zero" = primeiro push / branch novo; nesse caso comparamos com a árvore
// vazia para que tudo conte como arquivo novo.
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const ZERO_SHA = '0000000000000000000000000000000000000000';
let BEFORE_SHA = process.env.BEFORE_SHA || 'HEAD~1';
if (BEFORE_SHA === ZERO_SHA) BEFORE_SHA = EMPTY_TREE;

const POST_DIRS = ['content/pt/posts', 'content/en/posts'];

if (!PERSONAL_API_KEY) {
  console.error('Error: POSTHOG_PERSONAL_API_KEY ausente (defina em .env ou nos secrets do repositório).');
  process.exit(1);
}

// Publicado quando draft NÃO é true. Cobre false, ausente e a string "false".
function isPublic(data) {
  return data.draft !== true && data.draft !== 'true';
}

// Retorna o conteúdo do arquivo num commit específico, ou null se não existia.
function gitShow(sha, file) {
  try {
    return execSync(`git show ${sha}:"${file}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function getChangedPostFiles() {
  const dirArgs = POST_DIRS.map((d) => `"${d}"`).join(' ');
  const out = execSync(`git diff --name-only ${BEFORE_SHA} ${AFTER_SHA} -- ${dirArgs}`, { encoding: 'utf8' });
  return out.split('\n').map((s) => s.trim()).filter((f) => f.endsWith('.md'));
}

// pt/en a partir de content/<lang>/posts/...
function langFromPath(file) {
  const m = file.match(/^content\/(pt|en)\//);
  return m ? m[1] : 'unknown';
}

async function createAnnotation(post) {
  const url = `${API_HOST}/api/projects/${PROJECT_ID}/annotations/`;
  const body = {
    content: `📝 Post publicado: "${post.title}"${post.url ? ` — ${post.url}` : ''}`,
    date_marker: new Date().toISOString(),
    scope: 'project',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERSONAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${detail}`);
  }
  return res.json();
}

async function main() {
  const files = getChangedPostFiles();
  if (files.length === 0) {
    console.log('Nenhum post alterado neste push.');
    return;
  }

  // Deduplica por URL (fallback: caminho sem o idioma) para não gerar duas
  // anotações quando pt e en do mesmo post ficam públicos no mesmo push.
  const published = new Map();

  for (const file of files) {
    const newRaw = gitShow(AFTER_SHA, file);
    if (newRaw === null) continue; // removido no push
    const oldRaw = gitShow(BEFORE_SHA, file);

    const newData = matter(newRaw).data;
    const wasPublic = oldRaw !== null && isPublic(matter(oldRaw).data);

    if (isPublic(newData) && !wasPublic) {
      const key = newData.url || file.replace(/^content\/(pt|en)\//, '');
      if (!published.has(key)) {
        published.set(key, {
          title: newData.title || path.basename(file, '.md'),
          url: newData.url || null,
          lang: langFromPath(file),
          file,
        });
      }
    }
  }

  if (published.size === 0) {
    console.log('Nenhum post ficou público neste push (nenhuma transição para draft: false).');
    return;
  }

  let failures = 0;
  for (const post of published.values()) {
    try {
      await createAnnotation(post);
      console.log(`Anotação criada: "${post.title}" (${post.lang}) — ${post.file}`);
    } catch (e) {
      failures++;
      console.error(`Falha ao criar anotação para ${post.file}: ${e.message}`);
    }
  }

  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
