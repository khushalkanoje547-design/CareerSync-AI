const mongoose = require('mongoose');
 
const savedOpportunitySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: {
    type: String,
    enum: ['saved', 'applied'],
    default: 'saved'
  },
  reminderSent: { type: Boolean, default: false }, // set true once a deadline reminder email has gone out
  createdAt: { type: Date, default: Date.now }
});
 
// One record per student+opportunity pair — saving something twice just
// updates the existing row instead of creating a duplicate.
savedOpportunitySchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
 
module.exports = mongoose.model('SavedOpportunity', savedOpportunitySchema);
 