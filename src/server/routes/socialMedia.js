
const express = require('express');
const router = express.Router();
const SocialMediaAccount = require('../models/SocialMediaAccount');

// Get all social media accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a social media account
router.post('/', async (req, res) => {
  const account = new SocialMediaAccount({
    platform: req.body.platform,
    username: req.body.username,
    url: req.body.url,
    subscribers: req.body.subscribers || 0
  });

  try {
    const newAccount = await account.save();
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a social media account
router.delete('/:id', async (req, res) => {
  try {
    await SocialMediaAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Social media account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
