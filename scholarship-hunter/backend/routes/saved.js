const express = require('express');
const router = express.Router();
const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');
 
// POST /api/saved/:studentId/:opportunityId
// Saves an opportunity (status: "saved"). If it's already saved or applied,
// this is a no-op on status — it won't downgrade an "applied" back to "saved".
router.post('/:studentId/:opportunityId', async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
 
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
 
    const existing = await SavedOpportunity.findOne({ studentId, opportunityId });
    if (existing) {
      return res.json(existing); // already saved or applied — leave as is
    }
 
    const saved = await SavedOpportunity.create({ studentId, opportunityId, status: 'saved' });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// PUT /api/saved/:studentId/:opportunityId/applied
// Marks an opportunity as applied. Creates the record if it didn't exist
// yet (a student can mark something applied without saving it first).
router.put('/:studentId/:opportunityId/applied', async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
 
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
 
    const updated = await SavedOpportunity.findOneAndUpdate(
      { studentId, opportunityId },
      { $set: { status: 'applied' } },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// DELETE /api/saved/:studentId/:opportunityId
// Removes a saved/applied record entirely (the "unsave" action).
router.delete('/:studentId/:opportunityId', async (req, res) => {
  try {
    const { studentId, opportunityId } = req.params;
    await SavedOpportunity.deleteOne({ studentId, opportunityId });
    res.json({ removed: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// GET /api/saved/:studentId
// Lists everything this student has saved or applied to, with the full
// opportunity details attached (not just the IDs).
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
 
    const records = await SavedOpportunity.find({ studentId }).sort({ createdAt: -1 });
    const opportunityIds = records.map(r => r.opportunityId);
    const opportunities = await Opportunity.find({ _id: { $in: opportunityIds } });
    const oppMap = new Map(opportunities.map(o => [o._id.toString(), o]));
 
    const result = records
      .filter(r => oppMap.has(r.opportunityId.toString())) // skip if the opportunity was deleted
      .map(r => ({
        ...oppMap.get(r.opportunityId.toString()).toObject(),
        status: r.status,
        savedAt: r.createdAt
      }));
 
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
module.exports = router;
 