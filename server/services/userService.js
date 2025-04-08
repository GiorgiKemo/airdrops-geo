const User = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Service for handling user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registered user with token
   */
  async registerUser(userData) {
    const { username, email, password } = userData;
    
    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      if (userExists.email === email) {
        throw new Error('Email already in use');
      }
      throw new Error('Username already taken');
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: 'user',
    });
    
    // Generate token
    const token = this.generateToken(user._id);
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    };
  }
  
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Logged in user with token
   */
  async loginUser(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    };
  }
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid user ID');
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );
  }
  
  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} - Decoded token payload
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      
      const user = await this.getUserById(decoded.id);
      
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new UserService();
