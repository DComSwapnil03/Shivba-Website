const mongoose = require('mongoose');

// Sub-schema for individual subscriptions (Gym, Library, etc.)
const MemberServiceSchema = new mongoose.Schema({
  serviceId: { 
    type: String, 
    required: true,
    enum: ['talim', 'library', 'hostel', 'personal_training', 'general_service'] // Restrict to known IDs
  },
  serviceName: { 
    type: String, 
    required: true 
  },
  planDuration: { 
    type: String 
  }, // e.g., "3 Months", "1 Year"
  subscriptionDate: { 
    type: Date, 
    default: Date.now 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  totalFee: { 
    type: Number, 
    required: true 
  },
  feePaid: { 
    type: Number, 
    required: true 
  },
  paymentId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled'], 
    default: 'active' 
  }
});

// Main Member Schema
const MemberSchema = new mongoose.Schema({
  // Link to Auth User (Optional but recommended for future)
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterestRegistration' }, 

  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: { 
    type: String, 
    required: true 
  },
  
  // --- Extra Profile Details (Useful for Gym/Hostel) ---
  profileImage: { type: String }, // URL to image
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  bloodGroup: { type: String },
  address: { type: String },
  emergencyContact: { type: String },

  joiningDate: { 
    type: Date, 
    default: Date.now 
  },

  // Array of all services purchased by this member
  services: [MemberServiceSchema]
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Virtual field to check if member has ANY active service
MemberSchema.virtual('isActiveMember').get(function() {
  return this.services.some(s => s.status === 'active' && s.expiryDate > new Date());
});

module.exports = mongoose.model('Member', MemberSchema);