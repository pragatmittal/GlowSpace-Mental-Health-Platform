const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout
} = require('../controllers/authController');

// Import middleware
const { protect, rateLimitAuth } = require('../middlewares/auth');
const {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateUpdateProfile
} = require('../middlewares/validators');

// Public routes
router.post('/register', rateLimitAuth(5, 15 * 60 * 1000), validateRegister, register);
router.post('/login', rateLimitAuth(10, 15 * 60 * 1000), validateLogin, login);
router.post('/google', validateGoogleAuth, googleAuth);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', rateLimitAuth(5, 15 * 60 * 1000), validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', rateLimitAuth(5, 15 * 60 * 1000), validateResetPassword, resetPassword);
router.post('/refresh', refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/logout', logout);

module.exports = router;
