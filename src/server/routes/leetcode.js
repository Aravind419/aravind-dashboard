
const express = require('express');
const router = express.Router();
const LeetCodeProblem = require('../models/LeetCodeProblem');

// Get all leetcode problems
router.get('/', async (req, res) => {
  try {
    const problems = await LeetCodeProblem.find().sort({ date: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a leetcode problem
router.post('/', async (req, res) => {
  const problem = new LeetCodeProblem({
    title: req.body.title,
    difficulty: req.body.difficulty,
    date: req.body.date || new Date().toISOString(),
    link: req.body.link
  });

  try {
    const newProblem = await problem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a leetcode problem
router.delete('/:id', async (req, res) => {
  try {
    await LeetCodeProblem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
