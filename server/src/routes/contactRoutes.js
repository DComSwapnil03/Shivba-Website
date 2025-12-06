const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- 1. MODEL DEFINITION (Safer) ---
// We define the schema right here if it doesn't exist, or import it if you prefer.
// This prevents "Module Not Found" errors if your index.js export is broken.
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// Reuse existing model if compiled, otherwise compile it
const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactSchema);

// --- 2. THE ROUTE ---
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // A. Basic Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Please fill out all required fields (Name, Email, Subject, Message).' 
      });
    }

    // B. Basic Email Format Check (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address.' 
      });
    }

    // C. Save to Database
    const newMessage = new ContactMessage({ 
      name, 
      email, 
      phone, 
      subject, 
      message 
    });
    
    await newMessage.save();
    console.log(`[Contact] 📩 New message saved from: ${email}`);

    // D. Success Response
    res.status(201).json({ 
      success: true, 
      message: 'Message received successfully!' 
    });

  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving message. Please try again later.' 
    });
  }
});

module.exports = router;