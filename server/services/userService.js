const User = require('../models/userModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const emailService = require('./emailService');
const logger = require('../utils/logger');

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
   * @param {string} emailOrUsername - User email or username
   * @param {string} password - User password
   * @returns {Promise<Object>} - Logged in user with token
   */
  async loginUser(emailOrUsername, password) {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

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

  /**
   * Request a password reset
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success status
   */
  async requestPasswordReset(email) {
    try {
      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        logger.info(`No user found with email: ${email.substring(0, 3)}***`);
        return false;
      }

      logger.info(`User found for password reset: ${user.username}`);

      // Delete any existing reset tokens for this user
      await PasswordResetToken.deleteMany({ userId: user._id });
      logger.info(`Deleted existing reset tokens for user: ${user.username}`);

      // Generate a random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      logger.info(`Generated reset token for user: ${user.username}`);

      // Save the token
      await PasswordResetToken.create({
        userId: user._id,
        token: resetToken,
      });
      logger.info(`Saved reset token for user: ${user.username}`);

      // Send reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        user.username,
        resetToken
      );

      logger.info(`Email sending result for ${user.username}: ${emailSent ? 'Success' : 'Failed'}`);
      return emailSent;
    } catch (error) {
      logger.error(`Error in requestPasswordReset: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
      return false;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async resetPassword(token, newPassword) {
    // Find the token
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired (MongoDB should auto-delete expired tokens, but double-check)
    const tokenCreatedAt = new Date(resetToken.createdAt);
    const now = new Date();
    const tokenAgeInSeconds = Math.floor((now - tokenCreatedAt) / 1000);

    if (tokenAgeInSeconds > 3600) { // 1 hour in seconds
      // Delete the expired token
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      throw new Error('Invalid or expired reset token');
    }

    // Find the user
    const user = await User.findById(resetToken.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete the token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    return true;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserProfile(userId, profileData) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    // Sanitize input - only allow specific fields to be updated
    const sanitizedData = {};

    if (profileData.displayName) {
      sanitizedData.displayName = profileData.displayName.trim();
    }

    if (profileData.bio) {
      sanitizedData.bio = profileData.bio.trim();
    }

    if (profileData.avatar) {
      sanitizedData.avatar = profileData.avatar.trim();
    }

    // Handle social accounts
    if (profileData.socialAccounts) {
      sanitizedData.socialAccounts = {};

      if (profileData.socialAccounts.twitter) {
        sanitizedData.socialAccounts.twitter = profileData.socialAccounts.twitter.trim();
      }

      if (profileData.socialAccounts.discord) {
        sanitizedData.socialAccounts.discord = profileData.socialAccounts.discord.trim();
      }

      if (profileData.socialAccounts.telegram) {
        sanitizedData.socialAccounts.telegram = profileData.socialAccounts.telegram.trim();
      }

      if (profileData.socialAccounts.github) {
        sanitizedData.socialAccounts.github = profileData.socialAccounts.github.trim();
      }
    }

    // Handle preferences
    if (profileData.preferences) {
      sanitizedData.preferences = {};

      if (typeof profileData.preferences.emailNotifications === 'boolean') {
        sanitizedData.preferences.emailNotifications = profileData.preferences.emailNotifications;
      }

      if (typeof profileData.preferences.darkMode === 'boolean') {
        sanitizedData.preferences.darkMode = profileData.preferences.darkMode;
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  async updatePassword(userId, currentPassword, newPassword) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return true;
  }
}

module.exports = new UserService();
