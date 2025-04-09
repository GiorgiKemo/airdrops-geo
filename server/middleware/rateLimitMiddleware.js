const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).json({
        message: options.message,
      });
    },
    ...options,
  };

  return rateLimit(defaultOptions);
};

// API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  statusCode: 429, // Too Many Requests
});

// Auth rate limiter (more strict)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per 15 minutes
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  statusCode: 429, // Too Many Requests
});

// Password reset request limiter (very strict)
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again after 1 hour.',
  statusCode: 429, // Too Many Requests
});

// Password reset confirmation limiter (very strict)
const passwordResetConfirmLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset confirmations per hour
  message: 'Too many password reset attempts, please try again after 1 hour.',
  statusCode: 429, // Too Many Requests
});

// Admin operations limiter
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 admin operations per 15 minutes
  message: 'Too many admin operations, please try again after 15 minutes.',
  statusCode: 429, // Too Many Requests
});

// User profile update limiter
const profileUpdateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 profile updates per 15 minutes
  message: 'Too many profile update attempts, please try again after 15 minutes.',
  statusCode: 429, // Too Many Requests
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  passwordResetConfirmLimiter,
  adminLimiter,
  profileUpdateLimiter,
  createRateLimiter,
};
