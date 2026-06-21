const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  sendEnquiryQuotation,
  saveEnquiryQuotationDraft,
  sendEnquiryOtp,
  verifyEnquiryOtp,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

const validateEnquiry = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('email').notEmpty().withMessage('Email address is required').isEmail().withMessage('Invalid email address').trim(),
  body('quantity').optional().trim(),
  body('productInterested').optional().trim(),
  body('message').optional().trim(),
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Quoted', 'Contacted', 'Closed'])
    .withMessage('Invalid status value'),
];

// Public routes to submit enquiry and handle OTP email verification
router.post('/send-otp', sendEnquiryOtp);
router.post('/verify-otp', verifyEnquiryOtp);
router.post('/', validateEnquiry, createEnquiry);

// Admin-only protected routes
router.get('/', protect, getEnquiries);
router.get('/:id', protect, getEnquiryById);
router.put('/:id/status', protect, validateStatusUpdate, updateEnquiryStatus);
router.post('/:id/send-quotation', protect, sendEnquiryQuotation);
router.put('/:id/quotation-draft', protect, saveEnquiryQuotationDraft);
router.delete('/:id', protect, deleteEnquiry);

module.exports = router;
