
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define a simple settings schema
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Get theme
router.get('/', async (req, res) => {
  try {
    const themeSetting = await Settings.findOne({ key: 'theme' });
    if (themeSetting) {
      res.json(themeSetting);
    } else {
      // Create default theme if not exists
      const defaultTheme = new Settings({
        key: 'theme',
        value: 'dark'
      });
      await defaultTheme.save();
      res.json(defaultTheme);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update theme
router.post('/', async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value || (value !== 'light' && value !== 'dark')) {
      return res.status(400).json({ message: 'Invalid theme value' });
    }
    
    const themeSetting = await Settings.findOneAndUpdate(
      { key: 'theme' },
      { value },
      { new: true, upsert: true }
    );
    
    res.json(themeSetting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
