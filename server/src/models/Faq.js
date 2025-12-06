const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  category: { type: String, required: true },
  questions: [
    {
      q: { type: String, required: true },
      a: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Faq', FaqSchema);
