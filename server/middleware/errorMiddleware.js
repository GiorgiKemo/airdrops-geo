const logger = require('../utils/logger');
const config = require('../config');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);
  
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send response
  res.status(statusCode).json({
    message: err.message,
    stack: config.server.isProduction ? '🥞' : err.stack,
  });
};

/**
 * Not found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
