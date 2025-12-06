const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
});

module.exports = mongoose.model('Service', ServiceSchema);
