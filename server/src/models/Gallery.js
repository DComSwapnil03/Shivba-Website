const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  category: { type: String, required: true },
  image: { type: String, required: true },
  caption: { type: String, required: true },
});

module.exports = mongoose.model('Gallery', GallerySchema);
