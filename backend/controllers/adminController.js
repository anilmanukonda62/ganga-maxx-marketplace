const jwt = require('jsonwebtoken');
const sendEmailViaBrevo = require('../utils/sendEmailViaBrevo');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Enquiry = require('../models/Enquiry');
const MultiEnquiry = require('../models/MultiEnquiry');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

// Temporary in-memory OTP storage
const otpStore = new Map();
const changePasswordOtpStore = new Map();


/**
 * Generate a JWT token
 * @param {string} id - Admin user ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Admin login & get token
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  // Find admin by username
  const admin = await Admin.findOne({ username });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: {
        username: admin.username,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

/**
 * @desc    Get current admin info
 * @route   GET /api/admin/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.admin._id,
      username: req.admin.username,
      createdAt: req.admin.createdAt,
    },
  });
});

/**
 * @desc    Get admin dashboard metrics
 * @route   GET /api/admin/dashboard
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    totalEnquiries,
    newEnquiries,
    lowStockProducts,
    outOfStockProducts,
    totalContactMessages,
    newContactMessages,
    totalMultiEnquiries,
    newMultiEnquiries,
    totalCategories,
  ] = await Promise.all([
    Product.countDocuments(),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'New' }),
    Product.countDocuments({ 'stock.status': 'low_stock' }),
    Product.countDocuments({ 'stock.status': 'out_of_stock' }),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: 'New' }),
    MultiEnquiry.countDocuments(),
    MultiEnquiry.countDocuments({ status: 'New' }),
    Category.countDocuments({ isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalEnquiries,
      newEnquiries,
      lowStockProducts,
      outOfStockProducts,
      totalContactMessages,
      newContactMessages,
      totalMultiEnquiries,
      newMultiEnquiries,
      totalCategories,
    },
  });
});

/**
 * @desc    Generate and send OTP for password reset
 * @route   POST /api/admin/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    res.status(400);
    throw new Error('Please provide admin username');
  }

  // Find admin by username
  const admin = await Admin.findOne({ username });
  if (!admin) {
    res.status(404);
    throw new Error('Admin username not found');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store in memory
  otpStore.set(username, { otp, expiresAt });

  // Send OTP Email via Nodemailer
  const mailOptions = {
    from: '"Ganga Maxx Admin Panel" <anilkumarmanukonda07@gmail.com>',
    to: 'anilkumarmanukonda07@gmail.com', // Sent to recovery email as specified
    subject: 'Ganga Maxx Admin Recovery - 6 Digit OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png" alt="Ganga Maxx Logo" style="max-height: 60px;" />
          <h2 style="color: #1a7a4c; margin-top: 10px;">Ganga Maxx Admin Recovery</h2>
        </div>
        <p>Hello Admin,</p>
        <p>A password reset request was initiated for username: <strong>${username}</strong>. Please use the following 6-digit OTP to verify your identity. This OTP is valid for <strong>10 minutes</strong>.</p>
        <div style="background-color: #f4fbf7; border: 1px dashed #1a7a4c; border-radius: 4px; padding: 15px; text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a7a4c;">${otp}</span>
        </div>
        <p style="color: #ef4444; font-size: 13px;">If you did not request this password reset, please ignore this email or secure your credentials immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #777777; text-align: center;">This is an automated security system notification.</p>
      </div>
    `,
  };

  await sendEmailViaBrevo({
    to: mailOptions.to,
    subject: mailOptions.subject,
    htmlContent: mailOptions.html,
  });

  res.json({
    success: true,
    message: 'OTP sent successfully to registered recovery email',
  });
});

/**
 * @desc    Verify OTP and return a reset token
 * @route   POST /api/admin/verify-otp
 * @access  Public
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { username, otp } = req.body;

  if (!username || !otp) {
    res.status(400);
    throw new Error('Please provide username and OTP');
  }

  const record = otpStore.get(username);

  if (!record) {
    res.status(400);
    throw new Error('No OTP request found for this admin');
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(username);
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Generate a temporary reset token (expires in 10 minutes)
  const resetToken = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });

  res.json({
    success: true,
    message: 'OTP verified successfully',
    resetToken,
  });
});

/**
 * @desc    Reset password using reset token
 * @route   POST /api/admin/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { username, resetToken, newPassword } = req.body;

  if (!username || !resetToken || !newPassword) {
    res.status(400);
    throw new Error('Please provide username, reset token and new password');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.username !== username) {
      res.status(400);
      throw new Error('Reset token mismatch');
    }

    // Find admin and update password
    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    admin.password = newPassword;
    await admin.save();

    // Clear OTP from memory
    otpStore.delete(username);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }
});

/**
 * @desc    Change logged-in admin password
 * @route   PUT /api/admin/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters long');
  }

  const admin = await Admin.findById(req.admin._id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Verify current password
  const isMatch = await admin.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid current password');
  }

  admin.password = newPassword;
  await admin.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Verify current password and send OTP for password change
 * @route   POST /api/admin/change-password-otp
 * @access  Private
 */
const changePasswordOtp = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;

  if (!currentPassword) {
    res.status(400);
    throw new Error('Please enter your current password');
  }

  const admin = await Admin.findById(req.admin._id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Verify current password
  const isMatch = await admin.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid current password');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1050; // 5 minutes (plus small buffer)

  // Store in memory
  changePasswordOtpStore.set(admin.username, { otp, expiresAt });

  // Send OTP via Nodemailer Gmail SMTP
  const mailOptions = {
    from: '"Ganga Maxx Admin Panel" <anilkumarmanukonda07@gmail.com>',
    to: 'anilkumarmanukonda07@gmail.com', // Sent to recovery email
    subject: 'Ganga Maxx Security - Change Password OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://res.cloudinary.com/dzncyz7bu/image/upload/v1781254441/Screenshot_2026-06-11_221827_rcucbp.png" alt="Ganga Maxx Logo" style="max-height: 60px;" />
          <h2 style="color: #1a7a4c; margin-top: 10px;">Security Verification</h2>
        </div>
        <p>Hello Admin,</p>
        <p>A request has been made to change your Ganga Maxx Admin password. Please use the following 6-digit OTP to verify your identity. This OTP is valid for <strong>5 minutes</strong>.</p>
        <div style="background-color: #f4fbf7; border: 1px dashed #1a7a4c; border-radius: 4px; padding: 15px; text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a7a4c;">${otp}</span>
        </div>
        <p style="color: #ef4444; font-size: 13px;">If you did not request this change, please ignore this email and review your security settings immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #777777; text-align: center;">This is an automated security system notification.</p>
      </div>
    `,
  };

  await sendEmailViaBrevo({
    to: mailOptions.to,
    subject: mailOptions.subject,
    htmlContent: mailOptions.html,
  });

  res.json({
    success: true,
    message: 'Verification OTP sent to registered recovery email',
  });
});

/**
 * @desc    Verify OTP for changing password
 * @route   POST /api/admin/verify-change-otp
 * @access  Private
 */
const verifyChangeOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    res.status(400);
    throw new Error('Please enter the 6-digit OTP code');
  }

  const username = req.admin.username;
  const record = changePasswordOtpStore.get(username);

  if (!record) {
    res.status(400);
    throw new Error('No OTP request found for this session');
  }

  if (Date.now() > record.expiresAt) {
    changePasswordOtpStore.delete(username);
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (record.otp !== otp) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Generate a temporary change token (valid for 10 minutes)
  const updateToken = jwt.sign(
    { id: req.admin._id, username, purpose: 'change-password' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

  res.json({
    success: true,
    message: 'OTP verified successfully',
    updateToken
  });
});

/**
 * @desc    Update password using update token
 * @route   POST /api/admin/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { newPassword, updateToken } = req.body;

  if (!newPassword || !updateToken) {
    res.status(400);
    throw new Error('Missing new password or security token');
  }

  // Validate rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  if (
    newPassword.length < 8 ||
    !hasUppercase ||
    !hasLowercase ||
    !hasNumber ||
    !hasSpecial
  ) {
    res.status(400);
    throw new Error(
      'New password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    );
  }

  try {
    // Verify updateToken
    const decoded = jwt.verify(updateToken, process.env.JWT_SECRET);
    
    if (decoded.username !== req.admin.username || decoded.purpose !== 'change-password') {
      res.status(400);
      throw new Error('Invalid security token');
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    // Check that it's not the same as the current password
    const isSame = await admin.matchPassword(newPassword);
    if (isSame) {
      res.status(400);
      throw new Error('New password cannot be the same as your current password');
    }

    // Save (pre-save handles bcrypt hashing)
    admin.password = newPassword;
    await admin.save();

    // Clear OTP from memory
    changePasswordOtpStore.delete(req.admin.username);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || 'Invalid or expired security token');
  }
});

module.exports = {
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
};
