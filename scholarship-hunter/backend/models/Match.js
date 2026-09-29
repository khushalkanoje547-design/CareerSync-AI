const mongoose = require('mongoose');
 
const matchSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  eligible: { type: Boolean, required: true },
  matchScore: { type: Number, required: true }, // 0-100
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
 
// One score per student+opportunity pair — re-running the matcher for the
// same pair updates the existing row instead of creating a duplicate.
matchSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
 
module.exports = mongoose.model('Match', matchSchema);
 