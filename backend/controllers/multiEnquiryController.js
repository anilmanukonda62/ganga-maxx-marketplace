const MultiEnquiry = require('../models/MultiEnquiry');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { generateQuotationEmailHTML } = require('../utils/emailHelper');
const sendEmailViaBrevo = require('../utils/sendEmailViaBrevo');
const generateQuotationPDF = require('../utils/generateQuotationPDF');

/**
 * @desc    Submit a new multi-product enquiry
 * @route   POST /api/multi-enquiries
 * @access  Public
 */
const createMultiEnquiry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { fullName, phone, email, companyName, message, products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('At least one product is required for enquiry');
  }

  // Calculate lineTotals and totalEstimatedAmount
  let totalEstimatedAmount = 0;
  const processedProducts = products.map((p) => {
    const qty = Number(p.quantity) || 1;
    const price = Number(p.unitPrice) || 0;
    const lineTotal = qty * price;
    totalEstimatedAmount += lineTotal;

    return {
      productId: p.productId,
      productName: p.productName,
      variant: p.variant || 'Default',
      unitPrice: price,
      quantity: qty,
      lineTotal
    };
  });

  const multiEnquiry = await MultiEnquiry.create({
    fullName,
    phone,
    email,
    companyName,
    message,
    products: processedProducts,
    totalEstimatedAmount,
    status: 'New'
  });

  res.status(201).json({
    success: true,
    message: 'Multi-product enquiry submitted successfully',
    data: multiEnquiry
  });
});

/**
 * @desc    Get all multi-enquiries (Admin only, newest first)
 * @route   GET /api/multi-enquiries
 * @access  Private
 */
const getMultiEnquiries = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { companyName: searchRegex },
      { 'products.productName': searchRegex },
      { message: searchRegex }
    ];
  }

  const enquiries = await MultiEnquiry.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: enquiries.length,
    data: enquiries
  });
});

/**
 * @desc    Get single multi-enquiry (Admin only)
 * @route   GET /api/multi-enquiries/:id
 * @access  Private
 */
const getMultiEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await MultiEnquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Multi-product enquiry not found');
  }

  res.json({
    success: true,
    data: enquiry
  });
});

/**
 * @desc    Update multi-enquiry status (Admin only)
 * @route   PUT /api/multi-enquiries/:id/status
 * @access  Private
 */
const updateMultiEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const enquiry = await MultiEnquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Multi-product enquiry not found');
  }

  enquiry.status = status;
  const updatedEnquiry = await enquiry.save();

  res.json({
    success: true,
    message: 'Status updated successfully',
    data: updatedEnquiry
  });
});

/**
 * @desc    Delete a multi-enquiry (Admin only)
 * @route   DELETE /api/multi-enquiries/:id
 * @access  Private
 */
const deleteMultiEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await MultiEnquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Multi-product enquiry not found');
  }

  await MultiEnquiry.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: 'Enquiry deleted successfully'
  });
});


/**
 * @desc    Send email quotation to a customer for a multi-enquiry
 * @route   POST /api/multi-enquiries/:id/send-quotation
 * @access  Private
 */
const sendMultiEnquiryQuotation = asyncHandler(async (req, res) => {
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

  const enquiry = await MultiEnquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Multi-product enquiry not found');
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
      notes
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
 * @desc    Save a quotation draft for a multi-enquiry without sending
 * @route   PUT /api/multi-enquiries/:id/quotation-draft
 * @access  Private
 */
const saveMultiEnquiryQuotationDraft = asyncHandler(async (req, res) => {
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
  const enquiry = await MultiEnquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Multi-product enquiry not found');
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
  createMultiEnquiry,
  getMultiEnquiries,
  getMultiEnquiryById,
  updateMultiEnquiryStatus,
  deleteMultiEnquiry,
  sendMultiEnquiryQuotation,
  saveMultiEnquiryQuotationDraft
};
