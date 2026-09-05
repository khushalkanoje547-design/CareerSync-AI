const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branch: { type: String, required: true }, // e.g. "Computer Science", "Mechanical"
  year: { type: Number, required: true }, // 1, 2, 3, 4
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    default: 'General'
  },
  skills: [{ type: String }], // e.g. ["React", "Python", "Public Speaking"]
  location: { type: String }, // city/state
  resumeText: { type: String }, // pasted resume text for now
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);