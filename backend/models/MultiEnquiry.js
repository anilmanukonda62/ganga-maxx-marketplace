const mongoose = require('mongoose');

const multiEnquirySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  companyName: { type: String, required: true },
  message: { type: String },
  products: [{
    productId: Number,
    productName: String,
    variant: String,
    unitPrice: Number,
    quantity: Number,
    lineTotal: Number
  }],
  totalEstimatedAmount: Number,
  status: { 
    type: String, 
    enum: ['New', 'Quoted', 'Contacted', 'Closed'], 
    default: 'New' 
  },
  whatsappSent: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  quotationSentAt: Date,
  finalQuotation: {
    products: [{
      productId: Number,
      productName: String,
      variant: String,
      available: Boolean,
      unitPrice: Number,
      quantity: Number,
      lineTotal: Number
    }],
    subtotal: Number,
    taxPercent: Number,
    taxAmount: Number,
    grandTotal: Number,
    validityDate: Date,
    notes: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MultiEnquiry', multiEnquirySchema);
