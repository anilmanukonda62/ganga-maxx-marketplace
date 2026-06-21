const Enquiry = require('../models/Enquiry');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { generateQuotationEmailHTML } = require('../utils/emailHelper');
const sendEmailViaBrevo = require('../utils/sendEmailViaBrevo');
const generateQuotationPDF = require('../utils/generateQuotationPDF');
const { validateEmailExists } = require('../utils/validateEmail');
const Otp = require('../models/Otp');
const { generateOTP } = require('../utils/otpService');
const jwt = require('jsonwebtoken');

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
    emailVerificationToken,
  } = req.body;

  if (!email || email.trim() === '') {
    res.status(400);
    throw new Error('Email is required');
  }

  if (!emailVerificationToken) {
    res.status(400);
    throw new Error('Email verification required. Please verify your email before submitting.');
  }

  // Verify the JWT token
  try {
    const decoded = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== 'enquiry-verification' || decoded.email !== email.toLowerCase().trim()) {
      res.status(400);
      throw new Error('Email verification required. Please verify your email before submitting.');
    }
  } catch (err) {
    res.status(400);
    throw new Error('Email verification required. Please verify your email before submitting.');
  }

  const enquiry = await Enquiry.create({
    fullName,
    phone,
    email: email.trim(),
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

/**
 * @desc    Send a 6-digit OTP code to verified email
 * @route   POST /api/enquiries/send-otp
 * @access  Public
 */
const sendEnquiryOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || email.trim() === '') {
    res.status(400);
    throw new Error('Email is required');
  }

  // Basic regex validation
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!EMAIL_REGEX.test(email)) {
    res.status(400);
    throw new Error('Invalid email address format');
  }

  const purpose = 'enquiry-verification';

  // Rate limit: check if OTP was sent to this email within the last 60 seconds
  const lastOtp = await Otp.findOne({ identifier: email.toLowerCase().trim(), purpose }).sort({ createdAt: -1 });
  if (lastOtp && (Date.now() - new Date(lastOtp.createdAt).getTime()) < 60 * 1000) {
    res.status(429);
    throw new Error('Please wait before requesting another OTP');
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete previous OTPs for this email & purpose
  await Otp.deleteMany({ identifier: email.toLowerCase().trim(), purpose });

  // Save new OTP
  await Otp.create({
    identifier: email.toLowerCase().trim(),
    purpose,
    otp,
    expiresAt,
  });

  // Send via Brevo
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png" alt="Ganga Maxx Logo" style="max-height: 60px;" />
        <h2 style="color: #16a34a; margin-top: 10px;">Ganga Maxx Marketplace</h2>
      </div>
      <p>Hello,</p>
      <p>Please use the following 6-digit verification code to verify your email address on the Enquiry form. This code is valid for <strong>5 minutes</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #16a34a; border-radius: 4px; padding: 15px; text-align: center; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #16a34a;">${otp}</span>
      </div>
      <p style="color: #ef4444; font-size: 13px;">If you did not request this verification code, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #777777; text-align: center;">This is an automated verification notification.</p>
    </div>
  `;

  await sendEmailViaBrevo({
    to: email.trim(),
    subject: 'Verify Your Email - Ganga Maxx Marketplace',
    htmlContent: emailHtml,
  });

  res.json({
    success: true,
    message: 'OTP sent to your email',
  });
});

/**
 * @desc    Verify a 6-digit OTP and return a signed JWT token
 * @route   POST /api/enquiries/verify-otp
 * @access  Public
 */
const verifyEnquiryOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide email and OTP');
  }

  const purpose = 'enquiry-verification';

  // Find the latest OTP record
  const record = await Otp.findOne({ identifier: email.toLowerCase().trim(), purpose }).sort({ createdAt: -1 });

  if (!record) {
    res.status(400);
    throw new Error('No OTP request found for this email');
  }

  // Check if attempts exceeded (max 5)
  if (record.attempts >= 5) {
    res.status(400);
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Increment attempts counter
  record.attempts += 1;
  await record.save();

  // Check expiration
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    res.status(400);
    throw new Error('OTP expired, please request a new one');
  }

  // Compare OTP
  if (record.otp !== otp.trim()) {
    res.status(400);
    throw new Error('Incorrect OTP, please try again');
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  // Generate short-lived verification token (30 minutes)
  const verificationToken = jwt.sign(
    { email: email.toLowerCase().trim(), purpose },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  res.json({
    success: true,
    message: 'Email verified successfully',
    verificationToken,
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
  sendEnquiryOtp,
  verifyEnquiryOtp,
};
