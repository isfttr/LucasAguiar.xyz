// Shared AI provider layer.
// DeepSeek (deepseek-v4-flash) is the primary provider; Gemini (gemini-2.5-flash)
// is kept as an automatic fallback used by the translate/backlinks scripts.
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEEPSEEK_MODEL = 'deepseek-v4-flash';
const GEMINI_MODEL = 'gemini-2.5-flash';

// DeepSeek's API is OpenAI-compatible, so we use the openai SDK pointed at their base URL.
const deepseekClient = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
  : null;

const geminiModel = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: GEMINI_MODEL })
  : null;

async function callDeepSeek(prompt) {
  const res = await deepseekClient.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.choices[0].message.content;
}

async function callGemini(prompt) {
  const res = await geminiModel.generateContent(prompt);
  return res.response.text();
}

// Robust across both providers: the openai SDK exposes e.status, Gemini surfaces
// the code inside e.message ("429 Too Many Requests").
function isRateLimit(e) {
  return e?.status === 429 || (e?.message && e.message.includes('429'));
}

module.exports = {
  callDeepSeek,
  callGemini,
  deepseekClient,
  geminiModel,
  isRateLimit,
  DEEPSEEK_MODEL,
  GEMINI_MODEL,
};
