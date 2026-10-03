// backend/services/drafter.js
//
// Generates a first-draft application/SOP paragraph for one student applying
// to one specific opportunity. Unlike matcher.js (which batches many
// opportunities into one call), this is always exactly one call per draft —
// there's nothing to batch, since a draft is already a single, deliberate,
// user-triggered action.

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildPrompt(student, opportunity) {
  return `You are helping an Indian college student write a first-draft application essay / statement
of purpose for a specific opportunity. Write in a genuine, specific, first-person voice — not
generic corporate language, and not over-the-top flattery of the organization.

STUDENT:
Name: ${student.name}
Branch: ${student.branch}, Year ${student.year}
Category: ${student.category}
Skills: ${(student.skills || []).join(', ') || 'Not specified'}
Location: ${student.location || 'Not specified'}
Resume / background:
${student.resumeText && student.resumeText.trim() ? student.resumeText.trim() : '(No resume text provided — write a shorter, more general draft that the student can personalize further before submitting.)'}

OPPORTUNITY:
Title: ${opportunity.title}
Type: ${opportunity.type}
Description: ${opportunity.description || 'Not specified'}

Write a first-draft application paragraph (150–250 words) that:
- Connects the student's actual background (branch, year, skills, and anything in their resume)
  to this specific opportunity — avoid vague statements that could apply to any opportunity
- Sounds like a real student wrote it, not an AI or a corporate brochure
- Does NOT invent facts, achievements, or experience the student did not provide
- Ends naturally, without a generic closing line like "Thank you for your consideration"

Respond with ONLY the draft paragraph itself — no heading, no markdown, no commentary before or after it.`;
}

/**
 * Generates one draft for one student-opportunity pair.
 * Returns the draft text as a plain string. Throws on API failure —
 * the caller (route) decides how to surface that to the user.
 */
async function generateDraft(student, opportunity) {
  const prompt = buildPrompt(student, opportunity);

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt
  });

  const text = response.text.trim();
  if (!text) {
    throw new Error('Gemini returned an empty draft');
  }

  return text;
}

module.exports = { generateDraft };
