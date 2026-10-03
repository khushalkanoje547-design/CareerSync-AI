const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Opportunity = require('../models/Opportunity');
const Draft = require('../models/Draft');
const { generateDraft } = require('../services/drafter');
 
// POST /api/drafts/:studentId/:opportunityId
// Returns the cached draft if one already exists for this pair — otherwise
// calls Gemini once, saves the result, and returns it. This is the endpoint
// the "Generate Draft" button calls; it never makes a redundant AI call.
router.post('/:studentId/:opportunityId', async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
 
    const existing = await Draft.findOne({ studentId, opportunityId });
    if (existing) {
      return res.json({ draftText: existing.draftText, cached: true });
    }
 
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
 
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
 
    const draftText = await generateDraft(student, opportunity);
 
    const draft = await Draft.findOneAndUpdate(
      { studentId, opportunityId },
      { $set: { draftText } },
      { upsert: true, new: true }
    );
 
    res.json({ draftText: draft.draftText, cached: false });
  } catch (err) {
    console.error('Draft generation failed:', err.message);
    res.status(500).json({
      error: 'Could not generate a draft right now. This may be a temporary AI service issue or the daily limit — please try again later.'
    });
  }
});
 
// POST /api/drafts/:studentId/:opportunityId/regenerate
// A deliberate, separate action — always calls Gemini again and overwrites
// the cached draft. Never triggered automatically by the normal flow.
router.post('/:studentId/:opportunityId/regenerate', async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
 
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
 
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
 
    const draftText = await generateDraft(student, opportunity);
 
    const draft = await Draft.findOneAndUpdate(
      { studentId, opportunityId },
      { $set: { draftText } },
      { upsert: true, new: true }
    );
 
    res.json({ draftText: draft.draftText, cached: false });
  } catch (err) {
    console.error('Draft regeneration failed:', err.message);
    res.status(500).json({
      error: 'Could not regenerate the draft right now. This may be a temporary AI service issue or the daily limit — please try again later.'
    });
  }
});
 
module.exports = router;
 