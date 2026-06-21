const Enquiry = require('../models/Enquiry');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { generateQuotationEmailHTML } = require('../utils/emailHelper');
const sendEmailViaBrevo = require('../utils/sendEmailViaBrevo');
const generateQuotationPDF = require('../utils/generateQuotationPDF');
const { validateEmailExists } = require('../utils/validateEmail');

/**
 * @desc    Submit a new enquiry
 * @route   POST /api/enquiries
 * @access  Public
 */
const createEnquiry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const {
    fullName,
    phone,
    email,
    companyName,
    productInterested,
    quantity,
    message,
  } = req.body;

  if (!email || email.trim() === '') {
    res.status(400);
    throw new Error('Email is required');
  }

  // Run email validation
  const emailValidation = await validateEmailExists(email);
  if (!emailValidation.valid) {
    res.status(400);
    throw new Error('This email does not exist. Please provide a valid, active email address.');
  }

  const enquiry = await Enquiry.create({
    fullName,
    phone,
    email,
    companyName,
    productInterested,
    quantity,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    data: enquiry,
  });
});

/**
 * @desc    Get all enquiries (Admin only, newest first)
 * @route   GET /api/enquiries
 * @access  Private
 */
const getEnquiries = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { companyName: searchRegex },
      { productInterested: searchRegex },
      { message: searchRegex },
    ];
  }

  const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: enquiries.length,
    data: enquiries,
  });
});

/**
 * @desc    Get single enquiry (Admin only)
 * @route   GET /api/enquiries/:id
 * @access  Private
 */
const getEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  res.json({
    success: true,
    data: enquiry,
  });
});

/**
 * @desc    Update enquiry status (Admin only)
 * @route   PUT /api/enquiries/:id/status
 * @access  Private
 */
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { status } = req.body;
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  enquiry.status = status;
  const updatedEnquiry = await enquiry.save();

  res.json({
    success: true,
    message: 'Enquiry status updated successfully',
    data: updatedEnquiry,
  });
});

/**
 * @desc    Delete an enquiry (Admin only)
 * @route   DELETE /api/enquiries/:id
 * @access  Private
 */
const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  await Enquiry.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: 'Enquiry deleted successfully',
  });
});


/**
 * @desc    Send email quotation to a customer for a single enquiry
 * @route   POST /api/enquiries/:id/send-quotation
 * @access  Private
 */
const sendEnquiryQuotation = asyncHandler(async (req, res) => {
  const {
    products,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    taxPercent,
    taxAmount,
    cgstAmount,
    sgstAmount,
    grandTotal,
    validityDate,
    notes
  } = req.body;

  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  if (!enquiry.email) {
    res.status(400);
    throw new Error('Customer does not have a registered email address');
  }

  const emailHtml = generateQuotationEmailHTML(
    enquiry.fullName,
    products,
    subtotal,
    taxPercent,
    taxAmount,
    grandTotal,
    validityDate,
    notes,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount
  );

  // Populate finalQuotation temporarily on enquiry object in memory so that generateQuotationPDF can read it
  enquiry.finalQuotation = {
    products,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate: taxPercent,
    taxPercent,
    cgstAmount,
    sgstAmount,
    taxAmount,
    grandTotal,
    validityDate,
    notes
  };

  let pdfBuffer;
  try {
    pdfBuffer = await generateQuotationPDF(
      enquiry,
      products,
      subtotal,
      taxPercent,
      taxAmount,
      grandTotal,
      validityDate,
      notes,
      discountType,
      discountValue,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount
    );
  } catch (pdfError) {
    console.error('Failed to generate quotation PDF:', pdfError);
    res.status(500);
    throw new Error(`Failed to generate quotation PDF: ${pdfError.message}`);
  }

  try {
    await sendEmailViaBrevo({
      to: enquiry.email,
      subject: `Ganga Maxx Supply Quotation - Enquiry ID: ${enquiry._id}`,
      htmlContent: emailHtml,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          name: `Quotation-GMX-QT-${enquiry._id.toString().substring(0, 8).toUpperCase()}.pdf`
        }
      ]
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  enquiry.emailSent = true;
  enquiry.quotationSentAt = new Date();
  enquiry.finalQuotation = {
    products,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate: taxPercent,
    taxPercent,
    cgstAmount,
    sgstAmount,
    taxAmount,
    grandTotal,
    validityDate,
    notes
  };
  enquiry.status = 'Quoted';
  
  const updatedEnquiry = await enquiry.save();

  res.json({
    success: true,
    message: 'Quotation email sent successfully',
    data: updatedEnquiry,
  });
});

/**
 * @desc    Save a quotation draft for a single enquiry without sending
 * @route   PUT /api/enquiries/:id/quotation-draft
 * @access  Private
 */
const saveEnquiryQuotationDraft = asyncHandler(async (req, res) => {
  const {
    products,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    taxPercent,
    taxAmount,
    cgstAmount,
    sgstAmount,
    grandTotal,
    validityDate,
    notes
  } = req.body;
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found');
  }

  enquiry.finalQuotation = {
    products,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate: taxPercent,
    taxPercent,
    cgstAmount,
    sgstAmount,
    taxAmount,
    grandTotal,
    validityDate,
    notes
  };
  
  const updatedEnquiry = await enquiry.save();

  res.json({
    success: true,
    message: 'Quotation draft saved successfully',
    data: updatedEnquiry,
  });
});

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  sendEnquiryQuotation,
  saveEnquiryQuotationDraft,
};
