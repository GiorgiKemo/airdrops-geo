const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Protect routes - verify token and set req.user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.auth.jwtSecret);

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        logger.warn(`Expired token used by user ID: ${decoded.id}`);
        return res.status(401).json({ message: 'Token expired, please login again' });
      }

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user exists
      if (!req.user) {
        logger.warn(`Token used for non-existent user ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User no longer exists' });
      }

      next();
    } catch (error) {
      logger.error(`Auth middleware error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    logger.warn(`Access attempt without token: ${req.originalUrl}`);
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Admin middleware - check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const admin = (req, res, next) => {
  logger.debug(`Admin check for user: ${req.user?._id}, role: ${req.user?.role}`);

  if (req.user && req.user.role === 'admin') {
    logger.info(`Admin access granted to: ${req.user.email} for ${req.originalUrl}`);
    next();
  } else {
    logger.warn(`Admin access denied to: ${req.user?.email || 'unknown'} for ${req.originalUrl}`);
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

/**
 * Optional auth middleware - set req.user if token exists, but don't require it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.auth.jwtSecret);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      // If user doesn't exist, just continue without setting req.user
      if (!req.user) {
        logger.debug(`Optional auth: Token used for non-existent user ID: ${decoded.id}`);
      }
    } catch (error) {
      // Just log the error and continue without setting req.user
      logger.debug(`Optional auth error: ${error.message}`);
    }
  }

  next();
};

module.exports = { protect, admin, optionalAuth };
