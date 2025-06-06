const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

class Tracking {
  /**
   * Find tracking data by user ID
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object|null>} - Tracking data or null
   */
  static async findOne(filter) {
    try {
      if (filter.userId) {
        const { data, error } = await supabase
          .from('tracking')
          .select('*')
          .eq('user_id', filter.userId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned (not found)
            return null;
          }
          logger.error(`Error finding tracking data: ${error.message}`);
          return null;
        }
        
        return {
          _id: data.id,
          userId: data.user_id,
          airdropIds: data.airdrop_ids,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      return null;
    } catch (error) {
      logger.error(`Error in findOne: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Create new tracking data
   * @param {Object} trackingData - Tracking data
   * @returns {Promise<Object|null>} - Created tracking data or null
   */
  static async create(trackingData) {
    try {
      const { data, error } = await supabase
        .from('tracking')
        .insert({
          user_id: trackingData.userId,
          airdrop_ids: trackingData.airdropIds || []
        })
        .select()
        .single();
        
      if (error) {
        logger.error(`Error creating tracking data: ${error.message}`);
        return null;
      }
      
      return {
        _id: data.id,
        userId: data.user_id,
        airdropIds: data.airdrop_ids,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      logger.error(`Error in create: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Update tracking data
   * @param {string} id - Tracking ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated tracking data or null
   */
  static async findByIdAndUpdate(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('tracking')
        .update({
          airdrop_ids: updateData.airdropIds
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error(`Error updating tracking data: ${error.message}`);
        return null;
      }
      
      return {
        _id: data.id,
        userId: data.user_id,
        airdropIds: data.airdrop_ids,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      logger.error(`Error in findByIdAndUpdate: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Find or create tracking data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Tracking data or null
   */
  static async findOrCreate(userId) {
    try {
      // Try to find existing tracking data
      const { data: existingData, error: findError } = await supabase
        .from('tracking')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (!findError && existingData) {
        return {
          _id: existingData.id,
          userId: existingData.user_id,
          airdropIds: existingData.airdrop_ids,
          createdAt: existingData.created_at,
          updatedAt: existingData.updated_at
        };
      }
      
      // Create new tracking data
      const { data: newData, error: createError } = await supabase
        .from('tracking')
        .insert({
          user_id: userId,
          airdrop_ids: []
        })
        .select()
        .single();
        
      if (createError) {
        logger.error(`Error creating tracking data: ${createError.message}`);
        return null;
      }
      
      return {
        _id: newData.id,
        userId: newData.user_id,
        airdropIds: newData.airdrop_ids,
        createdAt: newData.created_at,
        updatedAt: newData.updated_at
      };
    } catch (error) {
      logger.error(`Error in findOrCreate: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Add airdrop to tracking
   * @param {string} userId - User ID
   * @param {string|number} airdropId - Airdrop ID
   * @returns {Promise<boolean>} - Success status
   */
  static async addAirdrop(userId, airdropId) {
    try {
      // Get current tracking data
      const tracking = await this.findOrCreate(userId);
      
      if (!tracking) {
        return false;
      }
      
      // Check if airdrop is already tracked
      if (tracking.airdropIds.includes(airdropId)) {
        return true;
      }
      
      // Add airdrop to tracking
      const newAirdropIds = [...tracking.airdropIds, airdropId];
      
      const { error } = await supabase
        .from('tracking')
        .update({
          airdrop_ids: newAirdropIds
        })
        .eq('id', tracking._id);
        
      if (error) {
        logger.error(`Error adding airdrop to tracking: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error in addAirdrop: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Remove airdrop from tracking
   * @param {string} userId - User ID
   * @param {string|number} airdropId - Airdrop ID
   * @returns {Promise<boolean>} - Success status
   */
  static async removeAirdrop(userId, airdropId) {
    try {
      // Get current tracking data
      const { data: tracking, error: findError } = await supabase
        .from('tracking')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (findError || !tracking) {
        return false;
      }
      
      // Remove airdrop from tracking
      const newAirdropIds = tracking.airdrop_ids.filter(id => id !== airdropId);
      
      const { error } = await supabase
        .from('tracking')
        .update({
          airdrop_ids: newAirdropIds
        })
        .eq('id', tracking.id);
        
      if (error) {
        logger.error(`Error removing airdrop from tracking: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error in removeAirdrop: ${error.message}`);
      return false;
    }
  }
}

module.exports = Tracking;
