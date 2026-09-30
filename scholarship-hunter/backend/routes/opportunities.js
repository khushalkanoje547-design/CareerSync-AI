const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const Student = require('../models/Student');
const Match = require('../models/Match');
const { matchOpportunities } = require('../services/matcher');
 
// POST /api/opportunities - add a new opportunity (for testing / seed later)
router.post('/', async (req, res) => {
  try {
    const opportunity = new Opportunity(req.body);
    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// GET /api/opportunities - list all opportunities
router.get('/', async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ deadline: 1 });
    res.json(opportunities);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// GET /api/opportunities/match/:studentId - hybrid match:
// 1) rule-based filter (cheap, instant) narrows down candidates
// 2) Gemini scores only the survivors, ONE call per student, cached in Match
// 3) if a student+opportunity pair is already cached, skip the AI entirely
// 4) if Gemini fails for any reason, fall back to the rule-based result so
//    the page never breaks — it just loses the AI score/reason for that visit
router.get('/match/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
 
    const allOpportunities = await Opportunity.find({ deadline: { $gte: new Date() } });
 
    const ruleFiltered = allOpportunities.filter(opp => {
      const branchOk = opp.eligibleBranches.length === 0 ||
        opp.eligibleBranches.includes('any') ||
        opp.eligibleBranches.includes(student.branch);
 
      const yearOk = opp.eligibleYears.length === 0 ||
        opp.eligibleYears.includes(student.year);
 
      const categoryOk = opp.eligibleCategories.length === 0 ||
        opp.eligibleCategories.includes('any') ||
        opp.eligibleCategories.includes(student.category);
 
      return branchOk && yearOk && categoryOk;
    });
 
    if (ruleFiltered.length === 0) {
      return res.json([]);
    }
 
    // Which of these has this student already been scored against?
    const existingMatches = await Match.find({
      studentId: student._id,
      opportunityId: { $in: ruleFiltered.map(o => o._id) }
    });
    const cachedIds = new Set(existingMatches.map(m => m.opportunityId.toString()));
    const uncachedOpps = ruleFiltered.filter(o => !cachedIds.has(o._id.toString()));
 
    if (uncachedOpps.length > 0) {
      try {
        const aiResults = await matchOpportunities(student, uncachedOpps);
 
        const bulkOps = aiResults.map(r => ({
          updateOne: {
            filter: { studentId: student._id, opportunityId: r.id },
            update: { $set: { eligible: r.eligible, matchScore: r.matchScore, reason: r.reason } },
            upsert: true
          }
        }));
 
        if (bulkOps.length > 0) {
          await Match.bulkWrite(bulkOps);
        }
      } catch (aiError) {
        // AI failed (rate limit, bad JSON, etc.) — log it and continue with
        // whatever is cached; uncached opportunities just show without a score.
        console.error('Gemini matching failed, falling back to rule-based results:', aiError.message);
      }
    }
 
    const allMatchRecords = await Match.find({
      studentId: student._id,
      opportunityId: { $in: ruleFiltered.map(o => o._id) }
    });
    const matchMap = new Map(allMatchRecords.map(m => [m.opportunityId.toString(), m]));
 
    const result = ruleFiltered.map(opp => {
      const m = matchMap.get(opp._id.toString());
      return {
        ...opp.toObject(),
        matchScore: m ? m.matchScore : null,
        matchReason: m ? m.reason : null
      };
    });
 
    // AI-scored opportunities first (highest score first); unscored ones
    // (AI unavailable) fall to the end, keeping their original deadline order.
    result.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
 
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
module.exports = router;
 