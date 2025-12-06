const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
  // The User's details
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'] 
  },
  
  // --- UPDATED SECTION ---
  // Changed type to String to accept IDs like "wellness-yoga-camp"
  eventId: { 
    type: String, 
    required: true 
  },
  // -----------------------

  eventTitle: {
    type: String,
    required: true
  },
  
  // Metadata
  registeredAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);