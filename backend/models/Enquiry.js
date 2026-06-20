const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    productInterested: {
      type: String,
      trim: true,
    },
    quantity: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Enquiry status is required'],
      enum: {
        values: ['New', 'Quoted', 'Contacted', 'Closed'],
        message: '{VALUE} is not a valid enquiry status',
      },
      default: 'New',
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
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
