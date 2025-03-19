
const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');

// Get all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ date: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a certificate
router.post('/', async (req, res) => {
  const certificate = new Certificate({
    title: req.body.title,
    fileName: req.body.fileName,
    fileType: req.body.fileType,
    fileSize: req.body.fileSize,
    dataUrl: req.body.dataUrl,
    date: req.body.date || new Date().toISOString()
  });

  try {
    const newCertificate = await certificate.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a certificate
router.delete('/:id', async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
