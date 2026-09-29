// backend/services/matcher.js
//
// Calls Gemini once per student, with every candidate opportunity batched
// into a single prompt (this matters a lot on the free tier: 20 requests/day
// total, so we cannot afford one call per opportunity).
 
const { GoogleGenAI } = require('@google/genai');
 
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
 
// Only send fields relevant to eligibility — never name or email.
function buildStudentSummary(student) {
  return {
    branch: student.branch,
    year: student.year,
    category: student.category,
    skills: student.skills,
    location: student.location
  };
}
 
function buildOpportunitySummary(opp) {
  return {
    id: opp._id.toString(),
    title: opp.title,
    type: opp.type,
    eligibleBranches: opp.eligibleBranches,
    eligibleYears: opp.eligibleYears,
    eligibleCategories: opp.eligibleCategories,
    location: opp.location,
    description: opp.description
  };
}
 
function buildPrompt(student, opportunities) {
  const studentJson = JSON.stringify(buildStudentSummary(student));
  const oppsJson = JSON.stringify(opportunities.map(buildOpportunitySummary));
 
  return `You are an eligibility-matching assistant for an Indian college student opportunity platform.
 
STUDENT PROFILE:
${studentJson}
 
CANDIDATE OPPORTUNITIES (a JSON array):
${oppsJson}
 
For EVERY opportunity in the array, decide whether this specific student is eligible, based on
branch, year, category, and location fields matching (an "any" value means open to everyone).
Also weigh how well the student's skills fit the opportunity's description, where relevant.
 
Respond with ONLY a JSON array (no markdown, no code fences, no extra text) where each item has
exactly this shape:
{"id": "<opportunity id, copied exactly>", "eligible": true or false, "match_score": <integer 0-100>, "reason": "<one short sentence, under 20 words>"}
 
Return exactly one result per opportunity, in the same order they were given.`;
}
 
// Strips markdown code fences if the model wraps its JSON in them despite instructions.
function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : trimmed;
}
 
/**
 * Scores a batch of opportunities for one student in a single Gemini call.
 * Returns an array of { id, eligible, matchScore, reason }.
 * Throws on API failure or unparseable output — the caller decides the fallback.
 */
async function matchOpportunities(student, opportunities) {
  if (opportunities.length === 0) return [];
 
  const prompt = buildPrompt(student, opportunities);
 
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });
 
  const raw = extractJson(response.text);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${err.message}`);
  }
 
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response was not a JSON array');
  }
 
  return parsed.map(item => ({
    id: item.id,
    eligible: Boolean(item.eligible),
    matchScore: Math.max(0, Math.min(100, Number(item.match_score) || 0)),
    reason: String(item.reason || '').slice(0, 200)
  }));
}
 
module.exports = { matchOpportunities };
 