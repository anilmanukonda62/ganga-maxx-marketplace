const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const { validateEmailExists } = require('../utils/validateEmail');

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
const createContactMessage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { name, email, phone, subject, message } = req.body;

  // Run real-time email existence check
  const emailValidation = await validateEmailExists(email);
  if (!emailValidation.valid) {
    res.status(400);
    throw new Error('This email does not exist. Please provide a valid, active email address.');
  }

  const contactMessage = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: contactMessage,
  });
});

/**
 * @desc    Get all contact messages (Admin only, newest first)
 * @route   GET /api/contact
 * @access  Private
 */
const getContactMessages = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  const messages = await ContactMessage.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

/**
 * @desc    Update contact message status (Admin only)
 * @route   PUT /api/contact/:id/status
 * @access  Private
 */
const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { status } = req.body;
  const contactMessage = await ContactMessage.findById(req.params.id);

  if (!contactMessage) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  contactMessage.status = status;
  const updatedMessage = await contactMessage.save();

  res.json({
    success: true,
    message: 'Message status updated successfully',
    data: updatedMessage,
  });
});

/**
 * @desc    Delete a contact message (Admin only)
 * @route   DELETE /api/contact/:id
 * @access  Private
 */
const deleteContactMessage = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findById(req.params.id);

  if (!contactMessage) {
    res.status(404);
    throw new Error('Contact message not found');
  }

  await ContactMessage.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: 'Message deleted successfully',
  });
});

module.exports = {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
};
