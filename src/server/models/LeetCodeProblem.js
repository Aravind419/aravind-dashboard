
const mongoose = require('mongoose');

const leetCodeProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  link: {
    type: String
  }
});

module.exports = mongoose.model('LeetCodeProblem', leetCodeProblemSchema);
