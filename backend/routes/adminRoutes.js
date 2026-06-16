const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getMe,
  getDashboardStats,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  changePasswordOtp,
  verifyChangeOtp,
  updatePassword,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboardStats);

// OTP & Password Recovery (Public)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Password Change (Protected)
router.put('/change-password', protect, changePassword); // Legacy support
router.post('/change-password-otp', protect, changePasswordOtp);
router.post('/verify-change-otp', protect, verifyChangeOtp);
router.post('/update-password', protect, updatePassword);

module.exports = router;
