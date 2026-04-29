const fs = require('fs');
const path = require('path');

const contentDirs = [
  path.join(__dirname, '../content/en'),
  path.join(__dirname, '../content/pt'),
  path.join(__dirname, '../content/draft')
];

// Regex to find markdown links like [text](/posts/slug/) or [text](posts/slug.md)
// It captures the text in $1 and the path in $2
const linkRegex = /\[([^\]]+)\]\((?:\/)?(posts\/[^\)]+?)\/?\)/g;

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const newContent = content.replace(linkRegex, (match, text, linkPath) => {
    // If it's already a hugo shortcode or http link, ignore
    if (linkPath.includes('{{<') || linkPath.startsWith('http')) {
      return match;
    }

    // Ensure it ends with .md for the ref shortcode
    let cleanPath = linkPath;
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    if (!cleanPath.endsWith('.md')) {
      cleanPath += '.md';
    }

    modified = true;
    return `[${text}]({{< ref "${cleanPath}" >}})`;
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated links in: ${filePath}`);
  }
}

contentDirs.forEach(processDirectory);
console.log("Finished fixing links.");
