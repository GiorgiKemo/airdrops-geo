const Tokens = require('csrf');
const logger = require('../utils/logger');

// Initialize CSRF tokens
const tokens = new Tokens();

// Generate a new CSRF secret for the session
const generateSecret = () => {
  return tokens.secretSync();
};

// Generate a CSRF token based on the secret
const generateToken = (secret) => {
  return tokens.create(secret);
};

// Verify a CSRF token against the secret
const verifyToken = (secret, token) => {
  return tokens.verify(secret, token);
};

// Middleware to check CSRF token
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests (they should be safe)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for API routes that use JWT authentication
  // This is because API clients might not support cookies
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  // Skip CSRF check for specific public endpoints that don't require authentication
  // These endpoints are safe to access without CSRF protection
  const publicEndpoints = [
    '/api/users/forgot-password',
    '/api/users/reset-password',
    '/api/users/register',
    '/api/users/login'
  ];

  if (publicEndpoints.includes(req.path)) {
    logger.info(`Skipping CSRF check for public endpoint: ${req.method} ${req.path}`);
    return next();
  }

  // Skip CSRF check for all routes during development
  // This is a temporary solution to allow testing without CSRF tokens
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Skipping CSRF check for ${req.method} ${req.path} in development mode`);
    return next();
  }

  const csrfSecret = req.cookies.csrfSecret;
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

  // If no CSRF secret or token, reject the request
  if (!csrfSecret || !csrfToken) {
    logger.warn(`CSRF validation failed: Missing ${!csrfSecret ? 'secret' : 'token'} for ${req.method} ${req.path}`);
    return res.status(403).json({
      message: 'CSRF validation failed. Please refresh the page and try again.'
    });
  }

  // Verify the token against the secret
  if (!verifyToken(csrfSecret, csrfToken)) {
    logger.warn(`CSRF validation failed: Invalid token for ${req.method} ${req.path}`);
    return res.status(403).json({
      message: 'CSRF validation failed. Please refresh the page and try again.'
    });
  }

  // Token is valid, proceed
  next();
};

// Middleware to set CSRF token in response
const setCsrfToken = (req, res, next) => {
  // Generate a new secret if one doesn't exist
  if (!req.cookies.csrfSecret) {
    const secret = generateSecret();
    // Set the secret as a cookie (HTTP only, secure in production)
    res.cookie('csrfSecret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    req.cookies.csrfSecret = secret;
  }

  // Generate a token from the secret and attach it to the response
  const token = generateToken(req.cookies.csrfSecret);
  res.locals.csrfToken = token;

  // Set the CSRF token in a custom header
  res.setHeader('X-CSRF-Token', token);

  next();
};

module.exports = {
  csrfProtection,
  setCsrfToken,
  generateSecret,
  generateToken,
  verifyToken
};
