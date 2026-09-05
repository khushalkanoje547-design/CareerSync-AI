const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['scholarship', 'hackathon', 'internship', 'govt_scheme'],
    required: true
  },
  eligibleBranches: [{ type: String }], // ["any"] means open to all branches
  eligibleYears: [{ type: Number }], // [1,2,3,4] or [] meaning any
  eligibleCategories: [{ type: String }], // ["General","OBC","SC","ST","EWS"] or ["any"]
  location: { type: String, default: 'any' }, // "any", "remote", or specific city/state
  deadline: { type: Date, required: true },
  link: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);