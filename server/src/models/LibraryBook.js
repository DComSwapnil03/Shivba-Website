const mongoose = require('mongoose');

const LibraryBookSchema = new mongoose.Schema({
    borrowerName: { type: String, required: true },
    bookTitle: { type: String, required: true },
    bookId: { type: String, required: true },
    status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' },
    issueDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LibraryBook', LibraryBookSchema);