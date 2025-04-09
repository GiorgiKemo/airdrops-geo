const { validationResult, body, param, query } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to check validation results
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  validateResults,
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .custom(value => {
      // Allow either email or username
      // Simple email validation (contains @ symbol)
      const isEmail = value.includes('@');
      if (isEmail) {
        // If it looks like an email, validate it as an email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Please provide a valid email');
        }
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validateResults,
];

/**
 * Validation rules for creating an airdrop
 */
const createAirdropValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Description must be at least 3 characters'),

  body('token')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Token must be between 1 and 20 characters'),

  body('criteria')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Criteria must be at least 3 characters'),

  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('status')
    .isIn(['active', 'upcoming', 'ended', 'claim'])
    .withMessage('Status must be active, upcoming, ended, or claim'),

  body('costType')
    .optional()
    .isIn(['free', 'paid'])
    .withMessage('Cost type must be free or paid'),

  body('link')
    .trim()
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Link must be a valid URL'),

  body('claimUrl')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Claim URL must be a valid URL'),

  body('socialLinks.website')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('socialLinks.discord')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Discord link must be a valid URL'),

  body('socialLinks.twitter')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Twitter link must be a valid URL'),

  body('socialLinks.telegram')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Telegram link must be a valid URL'),

  body('socialLinks.github')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub link must be a valid URL'),

  body('socialLinks.instagram')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Instagram link must be a valid URL'),

  validateResults,
];

/**
 * Validation rules for updating an airdrop
 */
const updateAirdropValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid airdrop ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  body('token')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Token must be between 1 and 20 characters'),

  body('criteria')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Criteria must be at least 5 characters'),

  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('status')
    .optional()
    .isIn(['active', 'upcoming', 'ended', 'claim'])
    .withMessage('Status must be active, upcoming, ended, or claim'),

  validateResults,
];

/**
 * Validation rules for tracking an airdrop
 */
const trackAirdropValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid airdrop ID'),

  validateResults,
];

/**
 * Validation rules for pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validateResults,
];

module.exports = {
  registerValidation,
  loginValidation,
  createAirdropValidation,
  updateAirdropValidation,
  trackAirdropValidation,
  paginationValidation,
};
