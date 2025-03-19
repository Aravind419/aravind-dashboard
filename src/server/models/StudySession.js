
const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  duration: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudySession', studySessionSchema);
