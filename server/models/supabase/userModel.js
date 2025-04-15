const { supabase } = require('../../config/supabase');
const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');

class User {
  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        logger.error(`Error finding user by ID: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error(`Error in findById: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findOne({ email }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned (not found)
          return null;
        }
        logger.error(`Error finding user by email: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error(`Error in findOne: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Find a user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User object or null
   */
  static async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned (not found)
          return null;
        }
        logger.error(`Error finding user by username: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error(`Error in findByUsername: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object|null>} - Created user or null
   */
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'user'
        })
        .select()
        .single();
        
      if (error) {
        logger.error(`Error creating user: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error(`Error in create: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated user or null
   */
  static async findByIdAndUpdate(id, updateData) {
    try {
      // If password is being updated, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error(`Error updating user: ${error.message}`);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error(`Error in findByIdAndUpdate: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async findByIdAndDelete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
        
      if (error) {
        logger.error(`Error deleting user: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error in findByIdAndDelete: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Compare password with stored hash
   * @param {string} enteredPassword - Password to compare
   * @param {string} storedPassword - Stored hashed password
   * @returns {Promise<boolean>} - Match status
   */
  static async matchPassword(enteredPassword, storedPassword) {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }
}

module.exports = User;
