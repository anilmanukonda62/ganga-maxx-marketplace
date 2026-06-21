const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  purpose: {
    type: String,
    required: true,
    enum: ['enquiry-verification', 'admin-password-reset'],
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// TTL index to automatically remove the document when current time exceeds expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for querying OTPs efficiently
otpSchema.index({ identifier: 1, purpose: 1 });

module.exports = mongoose.model('Otp', otpSchema);
