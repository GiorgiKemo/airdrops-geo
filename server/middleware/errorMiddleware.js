const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom error class for application errors
 * Allows for consistent error handling across the application
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Application-specific error code
   */
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Indicates this is an expected operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Determine if this is an operational error (expected) or a programming error (unexpected)
  const isOperationalError = err.isOperational || false;

  // Set default status code and message
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // In production, don't expose error details for non-operational errors
  const message = config.server.isProduction && !isOperationalError
    ? 'Something went wrong. Please try again later.'
    : err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message),
      errorCode: 'VALIDATION_ERROR'
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      errorCode: 'DUPLICATE_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.',
      errorCode: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Your token has expired. Please log in again.',
      errorCode: 'TOKEN_EXPIRED'
    });
  }

  // Send the error response
  res.status(statusCode).json({
    status: 'error',
    message,
    errorCode: err.errorCode || 'UNKNOWN_ERROR',
    ...(config.server.isProduction ? {} : { stack: err.stack })
  });
};

/**
 * Not found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const message = `Route not found: ${req.originalUrl}`;
  logger.warn(message);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  const error = new AppError(message, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

module.exports = { errorHandler, notFound, AppError };
