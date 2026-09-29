require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: 'Reply with exactly: Gemini is working'
  });
  console.log(response.text);
}

main().catch(err => console.error('Gemini error:', err.message));