const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model('Event', EventSchema);
