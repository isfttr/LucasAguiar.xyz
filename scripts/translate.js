require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const matter = require('gray-matter');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-2.5-flash for fast and cheap translations, but pro can be used for better quality.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const EN_DIR = path.join(__dirname, '../content/en');
const PT_DIR = path.join(__dirname, '../content/pt');

function getHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateContent(text, targetLang, retries = 5) {
  const prompt = `You are an expert technical translator for a Hugo blog.
Translate the following Markdown content to ${targetLang}.

STRICT RULES:
1. ONLY translate the natural language text.
2. DO NOT translate any Markdown syntax, URLs, or HTML tags.
3. DO NOT translate code blocks.
4. CRITICAL: DO NOT translate any Hugo shortcodes, especially {{< ref "..." >}}. Keep them exactly as they are.
5. Provide ONLY the translated text, without any markdown formatting wrappers like \`\`\`markdown around the whole output, and without any conversational filler.

Content to translate:
${text}`;

  for (let i = 0; i < retries; i++) {
    try {
      // Add a small delay between all requests to avoid hitting burst limits
      await sleep(2000); 
      const result = await model.generateContent(prompt);
      let output = result.response.text();
      // Remove potential markdown wrappers the model might add
      if (output.startsWith('```markdown')) {
        output = output.replace(/^```markdown\n?/, '').replace(/\n?```$/, '');
      }
      return output;
    } catch (e) {
      if (e.message && e.message.includes('429 Too Many Requests')) {
        // Extract retry delay from error if present
        let delayMs = 30000; // default 30s
        const match = e.message.match(/retry in (\d+(\.\d+)?)s/);
        if (match) {
          delayMs = (parseFloat(match[1]) + 5) * 1000; // add 5s buffer
        }
        console.warn(`Rate limit hit (429). Waiting ${delayMs/1000}s before retry ${i + 1}/${retries}...`);
        await sleep(delayMs);
      } else {
        console.error(`Translation failed: ${e.message}`);
        return null;
      }
    }
  }
  console.error('Max retries reached for translation.');
  return null;
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
    data.title = await translateContent(data.title, targetLang);
  }
  if (data.description) {
    data.description = await translateContent(data.description, targetLang);
  }
  
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
  const newRawContent = matter.stringify(translatedBody, data);
  
  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, newRawContent, 'utf8');
  console.log(`Successfully created: ${targetPath}`);
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

  for (const [relPath, files] of fileMap.entries()) {
    if (!relPath.endsWith('.md')) continue;

    const enPath = files.en;
    const ptPath = files.pt;

    if (enPath && !ptPath) {
      // Missing in PT
      await translateFile(enPath, path.join(PT_DIR, relPath), 'Portuguese');
    } else if (ptPath && !enPath) {
      // Missing in EN
      await translateFile(ptPath, path.join(EN_DIR, relPath), 'English');
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
         console.log(`Update detected in EN: ${relPath}`);
         await translateFile(enPath, ptPath, 'Portuguese');
      } 
      // If EN was translated from PT, and PT has changed
      else if (enParsed.data.translation_source_hash && enParsed.data.translation_source_hash !== ptHash) {
         console.log(`Update detected in PT: ${relPath}`);
         await translateFile(ptPath, enPath, 'English');
      }
      // If neither has a hash (old files), we might just skip or we could compare mtimes as a fallback.
      // For safety, we skip them until they are manually updated or run.
    }
  }
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

syncDirectories().then(() => console.log("Translation sync complete.")).catch(console.error);
