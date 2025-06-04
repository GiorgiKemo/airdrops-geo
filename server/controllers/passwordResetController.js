const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * @desc    Request password reset
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    logger.info(`Forgot password request received for email: ${req.body.email ? '***@***' : 'undefined'}`);
    logger.info(`Request headers: ${JSON.stringify(req.headers)}`);

    const { email } = req.body;

    if (!email) {
      logger.warn('Forgot password request missing email');
      return res.status(400).json({ message: 'Email is required' });
    }

    logger.info(`Processing password reset for email: ${email.substring(0, 3)}***`);

    // Request password reset
    const result = await userService.requestPasswordReset(email);

    logger.info(`Password reset request result: ${result ? 'Success' : 'No user found'}`);

    // Always return success even if email doesn't exist (for security)
    logger.info(`Password reset requested for: ${email.substring(0, 3)}***`);
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error(`Error requesting password reset: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);

    // Don't expose whether the email exists or not
    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/users/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Reset password
    const success = await userService.resetPassword(token, password);

    if (success) {
      logger.info('Password reset successful');
      res.status(200).json({ message: 'Password has been reset successfully' });
    } else {
      logger.error('Password reset failed');
      res.status(400).json({ message: 'Password reset failed' });
    }
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);

    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.status(500).json({ message: 'Password reset failed' });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
