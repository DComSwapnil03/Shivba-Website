// backend/models/PublishedEvent.js
const mongoose = require('mongoose');

const publishedEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Keeping as String/Date for easy frontend parsing
  time: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  shortDescription: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PublishedEvent', publishedEventSchema);