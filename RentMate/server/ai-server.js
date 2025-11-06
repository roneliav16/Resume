const express = require('express');
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const { requireAuth } = require('./authMiddleware');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;     // https://app.tavily.com (Free tier)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;     // https://ai.google.dev/ (Free tier)
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function webSearch(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${TAVILY_API_KEY}` },
    body: JSON.stringify({ query, include_answer: true, max_results: 5 })
  });
  if (!res.ok) return { results: [], answer: '' };
  return await res.json();
}

function buildPrompt(userInput, searchPayload) {
  const { title, description, basePrice, rentalDays } = userInput;
  const snippets = (searchPayload.results || []).map(r => `- ${r.title}: ${r.url}\n${r.content?.slice(0,300) || ''}`).join('\n');
  return `
You are a pricing assistant for a rental marketplace. The user wants an optimal daily rental price.

ITEM
- Title: ${title}
- Description: ${description}
- Current price (user idea): ${basePrice}
- Intended rental days: ${rentalDays}

WEB EVIDENCE (search summaries and snippets):
${snippets}

TASK
1) Suggest a single daily rental price (a number).
2) Give a confidence 0-100.
3) Justify briefly referencing the evidence.

Return ONLY valid JSON, without any extra characters or explanations.
The JSON must have this exact structure:
{"suggestedPrice": number, "confidence": number, "explanation": string}
`;
}

// POST /api/ai/price-suggest
router.post('/price-suggest', async (req, res) => {
  try {
    const { title, description = '', basePrice = 0, rentalDays = 1 } = req.body || {};
    if (!title || typeof title !== 'string') return res.status(400).json({ error: 'title is required' });

    const q = `rental price per day for "${title}" ${description ? '('+description+')' : ''} realistic market comparison`;
    const searchPayload = TAVILY_API_KEY ? await webSearch(q) : { results: [], answer: '' };

    if (!GOOGLE_API_KEY) {
      // fallback heuristic if no Gemini key
      const suggested = Math.max(1, Math.round(Number(basePrice || 10)));
      return res.json({ suggestedPrice: suggested, confidence: 50, explanation: 'Fallback heuristic (no Gemini key set).' });
    }

    const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
    });
    const prompt = buildPrompt({ title, description, basePrice, rentalDays }, searchPayload);
    const out = await model.generateContent(prompt);
    const text = out.response.text();
    // attempt to parse JSON from model
    let obj = null;
    try { obj = JSON.parse(text); } catch {
      // soft-parse: extract digits
      const m = text.match(/"suggestedPrice"\s*:\s*([0-9.]+)/);
      const price = m ? Math.round(Number(m[1])) : Math.max(1, Math.round(Number(basePrice || 10)));
      obj = { suggestedPrice: price, confidence: 60, explanation: 'Generated with Gemini; JSON recovered.' };
    }
    if (typeof obj.suggestedPrice !== 'number' || isNaN(obj.suggestedPrice)) {
      obj.suggestedPrice = Math.max(1, Math.round(Number(basePrice || 10)));
    }
    return res.json(obj);
  } catch (e) {
    if (res.headersSent) return;
    console.error('AI suggest error:', e);
    return res.status(500).json({ error: 'AI pricing failed' });
  }
});

module.exports = router;
