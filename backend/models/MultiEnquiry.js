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
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: Number,
    gstRate: Number,
    taxPercent: Number,
    cgstAmount: Number,
    sgstAmount: Number,
    taxAmount: Number,
    grandTotal: Number,
    validityDate: Date,
    notes: String,
    quotationNumber: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MultiEnquiry', multiEnquirySchema);
