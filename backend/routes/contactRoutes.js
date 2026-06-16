const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

const validateContactMessage = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email address').trim(),
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Read', 'Replied'])
    .withMessage('Invalid status value'),
];

// Public route to submit message
router.post('/', validateContactMessage, createContactMessage);

// Admin-only routes
router.get('/', protect, getContactMessages);
router.put('/:id/status', protect, validateStatusUpdate, updateContactMessageStatus);
router.delete('/:id', protect, deleteContactMessage);

module.exports = router;
