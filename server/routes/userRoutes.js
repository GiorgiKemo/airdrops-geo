const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  verifyToken,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const {
  registerValidation,
  loginValidation,
} = require('../middleware/validationMiddleware');

// Public routes with rate limiting for auth
router.route('/register')
  .post(authLimiter, registerValidation, registerUser);

router.route('/login')
  .post(authLimiter, loginValidation, loginUser);

router.route('/verify-token')
  .post(verifyToken);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile);

module.exports = router;
