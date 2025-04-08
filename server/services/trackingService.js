const Tracking = require('../models/trackingModel');
const Airdrop = require('../models/airdropModel');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Service for handling airdrop tracking operations
 */
class TrackingService {
  /**
   * Track an airdrop for a user
   * @param {string} userId - User ID
   * @param {string} airdropId - Airdrop ID
   * @returns {Promise<Object>} - Updated tracking object
   */
  async trackAirdrop(userId, airdropId) {
    try {
      // Validate airdrop exists
      const airdrop = await this.validateAirdrop(airdropId);
      
      // Find or create tracking document
      let tracking = await Tracking.findOne({ userId });
      
      if (!tracking) {
        // Create new tracking document
        tracking = new Tracking({
          userId,
          airdropIds: [airdropId],
        });
      } else {
        // Add airdrop to tracking if not already tracked
        if (!tracking.airdropIds.includes(airdropId)) {
          tracking.airdropIds.push(airdropId);
        }
      }
      
      await tracking.save();
      
      return {
        success: true,
        message: 'Airdrop tracked successfully',
        tracking: tracking.airdropIds,
      };
    } catch (error) {
      logger.error(`Error tracking airdrop: ${error.message}`);
      throw new Error(`Failed to track airdrop: ${error.message}`);
    }
  }
  
  /**
   * Untrack an airdrop for a user
   * @param {string} userId - User ID
   * @param {string} airdropId - Airdrop ID
   * @returns {Promise<Object>} - Updated tracking object
   */
  async untrackAirdrop(userId, airdropId) {
    try {
      // Find tracking document
      const tracking = await Tracking.findOne({ userId });
      
      if (!tracking) {
        throw new Error('No tracked airdrops found for this user');
      }
      
      // Remove airdrop from tracking
      tracking.airdropIds = tracking.airdropIds.filter(
        id => id.toString() !== airdropId.toString()
      );
      
      await tracking.save();
      
      return {
        success: true,
        message: 'Airdrop untracked successfully',
        tracking: tracking.airdropIds,
      };
    } catch (error) {
      logger.error(`Error untracking airdrop: ${error.message}`);
      throw new Error(`Failed to untrack airdrop: ${error.message}`);
    }
  }
  
  /**
   * Get all tracked airdrops for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of tracked airdrops
   */
  async getTrackedAirdrops(userId) {
    try {
      // Find tracking document
      const tracking = await Tracking.findOne({ userId });
      
      if (!tracking || tracking.airdropIds.length === 0) {
        return [];
      }
      
      // Get airdrop details for all tracked airdrops
      const airdrops = await Airdrop.find({
        _id: { $in: tracking.airdropIds },
      });
      
      return airdrops;
    } catch (error) {
      logger.error(`Error getting tracked airdrops: ${error.message}`);
      throw new Error(`Failed to get tracked airdrops: ${error.message}`);
    }
  }
  
  /**
   * Check if an airdrop is tracked by a user
   * @param {string} userId - User ID
   * @param {string} airdropId - Airdrop ID
   * @returns {Promise<boolean>} - Whether the airdrop is tracked
   */
  async isAirdropTracked(userId, airdropId) {
    try {
      // Find tracking document
      const tracking = await Tracking.findOne({ userId });
      
      if (!tracking) {
        return false;
      }
      
      // Check if airdrop is in tracking
      return tracking.airdropIds.some(
        id => id.toString() === airdropId.toString()
      );
    } catch (error) {
      logger.error(`Error checking if airdrop is tracked: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Validate that an airdrop exists
   * @param {string} airdropId - Airdrop ID
   * @returns {Promise<Object>} - Airdrop object
   * @throws {Error} - If airdrop doesn't exist
   */
  async validateAirdrop(airdropId) {
    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(airdropId)) {
      throw new Error('Invalid airdrop ID');
    }
    
    // Find airdrop
    const airdrop = await Airdrop.findById(airdropId);
    
    if (!airdrop) {
      throw new Error('Airdrop not found');
    }
    
    return airdrop;
  }
}

module.exports = new TrackingService();
