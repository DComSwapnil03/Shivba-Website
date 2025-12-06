const mongoose = require('mongoose');

const ValueSchema = new mongoose.Schema({
  iconName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('Value', ValueSchema);
