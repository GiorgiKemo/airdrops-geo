const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Register user
    const user = await userService.registerUser({ username, email, password });

    logger.info(`New user registered: ${email}`);

    res.status(201).json(user);
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);

    // Handle specific errors
    if (error.message.includes('already')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login user
    const user = await userService.loginUser(email, password);

    logger.info(`User logged in: ${email}`);

    res.json(user);
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);

    // Handle invalid credentials
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    // User is already set in req.user by the auth middleware
    res.json(req.user);
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify JWT token
 * @route   POST /api/users/verify-token
 * @route   GET /api/users/verify-token (protected)
 * @access  Public/Private
 */
const verifyToken = async (req, res) => {
  try {
    // For GET requests (protected route), user is already set in req.user
    if (req.method === 'GET' && req.user) {
      // Return the user data with a new token
      const token = userService.generateToken(req.user._id);
      return res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        token,
      });
    }

    // For POST requests, get token from body
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify token
    const user = await userService.verifyToken(token);

    res.json(user);
  } catch (error) {
    logger.error(`Error verifying token: ${error.message}`);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  verifyToken,
};
