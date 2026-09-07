const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const Student = require('../models/Student');

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

// GET /api/opportunities/match/:studentId - rule-based match
router.get('/match/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const allOpportunities = await Opportunity.find({ deadline: { $gte: new Date() } });

    const matched = allOpportunities.filter(opp => {
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

    res.json(matched);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;