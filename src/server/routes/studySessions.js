
const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');

// Get all study sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await StudySession.find().sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a study session
router.post('/', async (req, res) => {
  const session = new StudySession({
    duration: req.body.duration,
    subject: req.body.subject,
    date: req.body.date || new Date().toISOString()
  });

  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a study session
router.delete('/:id', async (req, res) => {
  try {
    await StudySession.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
