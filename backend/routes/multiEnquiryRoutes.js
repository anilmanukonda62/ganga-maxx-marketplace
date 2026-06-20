const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  createMultiEnquiry,
  getMultiEnquiries,
  getMultiEnquiryById,
  updateMultiEnquiryStatus,
  deleteMultiEnquiry,
  markMultiEnquiryWhatsappSent,
  sendMultiEnquiryQuotation,
  saveMultiEnquiryQuotationDraft
} = require('../controllers/multiEnquiryController');

const validateMultiEnquiry = [
  body('fullName').notEmpty().withMessage('Full name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('companyName').notEmpty().withMessage('Company name is required').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address').trim(),
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Quoted', 'Contacted', 'Closed'])
    .withMessage('Invalid status value'),
];

router.post('/', validateMultiEnquiry, createMultiEnquiry);

router.get('/', protect, getMultiEnquiries);
router.get('/:id', protect, getMultiEnquiryById);
router.put('/:id/status', protect, validateStatusUpdate, updateMultiEnquiryStatus);
router.put('/:id/mark-whatsapp-sent', protect, markMultiEnquiryWhatsappSent);
router.post('/:id/send-quotation', protect, sendMultiEnquiryQuotation);
router.put('/:id/quotation-draft', protect, saveMultiEnquiryQuotationDraft);
router.delete('/:id', protect, deleteMultiEnquiry);

module.exports = router;
