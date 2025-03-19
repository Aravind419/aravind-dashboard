
const mongoose = require('mongoose');

const socialMediaAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  subscribers: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('SocialMediaAccount', socialMediaAccountSchema);
