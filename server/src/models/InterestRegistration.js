const mongoose = require('mongoose');

// --- Sub-Schema: Payment History ---
// _id: false because this is just a log, we don't need to manage individual payment docs
const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String },
  amount: { type: Number, required: true }, // Amount in Rupees
  eventName: { type: String }, 
  status: { type: String, default: 'success' },
  date: { type: Date, default: Date.now }
}, { _id: false }); 

// --- Sub-Schema: Active Programs/Services ---
// We keep _id: true (default) here so you can easily find/update specific programs later
const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  status: { 
    type: String, 
    enum: ['active', 'expired', 'completed', 'registered'],
    default: 'active' 
  },
  registrationDate: { type: Date, default: Date.now },
  endDate: { type: Date }, 
  paymentId: { type: String } 
});

// --- Main Schema ---
const InterestRegistrationSchema = new mongoose.Schema({
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
    unique: true, 
    index: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true,
    alias: 'mobileNumber' // <--- CRITICAL FIX: Maps 'mobileNumber' to 'phone' automatically
  },
  // Password is optional to allow Guest Checkout
  password: {
    type: String,
    required: false, 
    select: false 
  },
  
  // --- Arrays using Sub-Schemas ---
  payments: {
    type: [PaymentSchema],
    default: [] 
  },

  programs: {
    type: [ProgramSchema],
    default: [] 
  },

  // --- Legacy Fields (Single Event support) ---
  eventName: { 
    type: String, 
    default: 'General Interest',
    trim: true
  },
  amount: { 
    type: Number, 
    default: 0 
  },
  
  // --- VERIFICATION FIELDS ---
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String,
    trim: true 
  }, 
  verifyToken: { 
    type: String, 
    index: true 
  },
  verifyTokenExpiresAt: { 
    type: Date 
  }
}, { 
  timestamps: true // Auto-manages createdAt and updatedAt
});

module.exports = mongoose.model('InterestRegistration', InterestRegistrationSchema);