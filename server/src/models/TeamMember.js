const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
