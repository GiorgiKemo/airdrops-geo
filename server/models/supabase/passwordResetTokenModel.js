const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

class PasswordResetToken {
  /**
   * Find a token by token string
   * @param {string} token - Token string
   * @returns {Promise<Object|null>} - Token object or null
   */
  static async findOne({ token }) {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned (not found)
          return null;
        }
        logger.error(`Error finding token: ${error.message}`);
        return null;
      }
      
      // Check if token is expired
      if (new Date(data.expires_at) < new Date()) {
        logger.info(`Token ${token.substring(0, 10)}... has expired`);
        return null;
      }
      
      return {
        _id: data.id,
        userId: data.user_id,
        token: data.token,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error(`Error in findOne: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Create a new password reset token
   * @param {Object} tokenData - Token data
   * @returns {Promise<Object|null>} - Created token or null
   */
  static async create(tokenData) {
    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: tokenData.userId,
          token: tokenData.token
        })
        .select()
        .single();
        
      if (error) {
        logger.error(`Error creating token: ${error.message}`);
        return null;
      }
      
      return {
        _id: data.id,
        userId: data.user_id,
        token: data.token,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error(`Error in create: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Delete tokens by user ID
   * @param {Object} filter - Filter criteria
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteMany(filter) {
    try {
      if (filter.userId) {
        const { error } = await supabase
          .from('password_reset_tokens')
          .delete()
          .eq('user_id', filter.userId);
          
        if (error) {
          logger.error(`Error deleting tokens: ${error.message}`);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Error in deleteMany: ${error.message}`);
      return false;
    }
  }
}

module.exports = PasswordResetToken;
