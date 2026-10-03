const mongoose = require('mongoose');
 
const draftSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  draftText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
 
// One draft per student+opportunity pair. Regenerating overwrites the
// existing row (via upsert in the route) instead of creating a duplicate.
draftSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
 
module.exports = mongoose.model('Draft', draftSchema);
 