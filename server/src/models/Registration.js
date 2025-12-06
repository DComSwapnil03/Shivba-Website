const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    index: true // Faster search by email
  },
  phone: { 
    type: String, 
    required: true,
    trim: true 
  },
  eventName: { 
    type: String, 
    required: true,
    trim: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  
  // --- RAZORPAY PAYMENT DETAILS ---
  paymentId: { 
    type: String, 
    required: true,
    unique: true, // Critical: Prevents duplicate payments being saved
    trim: true
  },
  orderId: { 
    type: String, 
    required: true,
    unique: true, // Critical: One registration per order
    trim: true
  },
  paymentSignature: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Status
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Registration', RegistrationSchema);