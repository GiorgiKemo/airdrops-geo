const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('registerUser - Creating new user with data:', { username, email });

    const user = await User.create({
      username,
      email,
      password,
      role: 'user', // Explicitly set role to 'user'
    });

    console.log('registerUser - Created user:', user);

    if (user) {
      const responseData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };

      console.log('registerUser - Response data:', responseData);
      res.status(201).json(responseData);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify JWT token and return user
// @route   GET /api/users/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    console.log('verifyToken - User from token:', req.user);

    const user = await User.findById(req.user._id).select('-password');
    console.log('verifyToken - User from database:', user);
    console.log('verifyToken - User role:', user?.role);

    if (user) {
      const responseData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: req.headers.authorization.split(' ')[1], // Return the same token
      };

      console.log('verifyToken - Response data:', responseData);
      res.json(responseData);
    } else {
      res.status(401).json({ message: 'Invalid token - user not found' });
    }
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create initial admin user if none exists
// @access  Internal
const createInitialAdminUser = async () => {
  try {
    // Check if any admin user exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('No admin user found. Creating initial admin user...');

      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        role: 'admin',
      });

      if (adminUser) {
        console.log(`Initial admin user created: ${adminUser.username}`);
      }
    } else {
      console.log('Admin user already exists. Skipping creation.');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  verifyToken,
  createInitialAdminUser,
};
