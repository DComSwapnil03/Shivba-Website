const mongoose = require('mongoose');

const LibraryUserSchema = new mongoose.Schema({
    seatNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    enrollDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Active' }
});

module.exports = mongoose.model('LibraryUser', LibraryUserSchema);