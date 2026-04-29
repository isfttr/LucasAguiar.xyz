# Multilingual Automation Walkthrough

I have successfully implemented the automated translation and backlink standardization pipeline. Here's a summary of what was accomplished and how you can use it going forward.

## What was implemented

### 1. `scripts/fix-links.js`
This script scans all your Markdown files and standardizes traditional Markdown links like `[Link](/posts/my-post/)` to Hugo's built-in `{{< ref "posts/my-post.md" >}}` syntax. 
- **Benefit:** This ensures that when a post is viewed in English, the links point to the English versions of other posts, and when viewed in Portuguese, they dynamically point to the Portuguese versions. No more broken cross-language links!
- **Status:** I ran this script and it successfully updated the links in your existing files (e.g., `backlog_inpi_2026.md`).

### 2. `scripts/translate.js`
This is the core automation script powered by the Gemini API (`gemini-2.5-flash`). 
- **How it works:** It bidirectionally compares `content/en` and `content/pt`. If a file exists in one but not the other, it translates the Front Matter (Title & Description) and the Markdown body, while strictly preserving Markdown formatting, Hugo shortcodes (like the `ref` links), code blocks, and Front Matter tags/dates.
- **Updates:** It uses a SHA-256 hash stored in the Front Matter (`translation_source_hash`) to detect if an original file was updated. If you modify an English file, the next time the script runs, it will detect the update and re-translate it to Portuguese automatically.
- **Rate Limiting:** Because the Gemini free tier has strict limits (5-15 requests per minute), the script includes an automatic exponential backoff. If it hits a `429 Too Many Requests` error, it reads the retry delay from the API and pauses before continuing. 

## How to Use It

I added two new NPM commands to your `package.json`. You can run these at any time:

1. **To translate missing/updated files:**
   ```bash
   npm run translate
   ```
2. **To fix new manual links:**
   ```bash
   npm run fix-links
   ```

> [!TIP]
> **Workflow integration:** Right now, you can run `npm run translate` manually before making a Git commit. Since you already use Husky, you can easily add `npm run translate` to your `.husky/pre-commit` file in the future so it runs automatically every time you commit!

## Current Status
The translation script is currently running in the background on your machine. It is translating the missing ~22 English posts to Portuguese. Because of the API rate limits on the free tier, it will periodically pause and wait for the limit to reset before continuing. You can just let it run until it finishes! All work is saved on the `feature/i18n-automation` branch.
