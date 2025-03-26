const Airdrop = require('../models/airdropModel');
const mongoose = require('mongoose');

/**
 * Service for handling airdrop-related operations
 */
class AirdropService {
  /**
   * Get all airdrops with optional filtering
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - Array of airdrops
   */
  async getAllAirdrops(filters = {}, options = {}) {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    return await Airdrop.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Get airdrop by ID
   * @param {string} id - Airdrop ID
   * @returns {Promise<Object>} - Airdrop object
   */
  async getAirdropById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid airdrop ID');
    }

    const airdrop = await Airdrop.findById(id);
    if (!airdrop) {
      throw new Error('Airdrop not found');
    }

    return airdrop;
  }

  /**
   * Create a new airdrop
   * @param {Object} airdropData - Airdrop data
   * @returns {Promise<Object>} - Created airdrop
   */
  async createAirdrop(airdropData) {
    try {
      // Generate a unique airdropId
      const latestAirdrop = await Airdrop.findOne().sort({ airdropId: -1 });
      airdropData.airdropId = latestAirdrop ? latestAirdrop.airdropId + 1 : 1;

      // Create the airdrop
      const airdrop = await Airdrop.create(airdropData);
      return airdrop;
    } catch (error) {
      throw new Error(`Error creating airdrop: ${error.message}`);
    }
  }

  /**
   * Update an existing airdrop
   * @param {string} id - Airdrop ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated airdrop
   */
  async updateAirdrop(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid airdrop ID');
    }

    const airdrop = await Airdrop.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!airdrop) {
      throw new Error('Airdrop not found');
    }

    return airdrop;
  }

  /**
   * Delete an airdrop
   * @param {string} id - Airdrop ID
   * @returns {Promise<Object>} - Deleted airdrop
   */
  async deleteAirdrop(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid airdrop ID');
    }

    const airdrop = await Airdrop.findByIdAndDelete(id);

    if (!airdrop) {
      throw new Error('Airdrop not found');
    }

    return airdrop;
  }

  /**
   * Update airdrop status
   * @param {string} id - Airdrop ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated airdrop
   */
  async updateAirdropStatus(id, status) {
    return this.updateAirdrop(id, { status });
  }

  /**
   * Add an update to an airdrop
   * @param {string} id - Airdrop ID
   * @param {string} content - Update content
   * @param {Object} options - Additional options
   * @param {boolean} options.skipTelegramNotification - Whether to skip Telegram notification
   * @param {boolean} options.sendTelegramNotification - Whether to send Telegram notification
   * @returns {Promise<Object>} - Updated airdrop
   */
  async addAirdropUpdate(id, content, options = {}) {
    try {
      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid airdrop ID');
      }

      // Find the airdrop
      const airdrop = await Airdrop.findById(id);

      if (!airdrop) {
        throw new Error('Airdrop not found');
      }

      // Create a new update
      const update = {
        content,
        date: new Date()
      };

      // Set the telegram data
      airdrop.telegram = airdrop.telegram || {};
      airdrop.telegram.explicitlySent = true;

      // Add the update to the airdrop
      airdrop.updates = airdrop.updates || [];
      airdrop.updates.push(update);

      // Save the airdrop
      await airdrop.save();

      // Check if we should skip Telegram notification
      const skipTelegramNotification = options.skipTelegramNotification === true;
      const sendTelegramNotification = options.sendTelegramNotification !== false; // Default to true if not specified

      // Send Telegram notification for the update if not skipped
      if (!skipTelegramNotification && sendTelegramNotification) {
        try {
          const telegramService = require('./telegramService');
          const telegramResult = await telegramService.sendAirdropUpdateToTelegram(
            airdrop,
            { updateContent: content, isExplicitUpdate: true }
          );

          // If successful, update the airdrop with the message ID
          if (telegramResult.success && telegramResult.messageId) {
            // Get the index of the last update
            const updateIndex = airdrop.updates.length - 1;

            // Add the Telegram message ID to the update
            airdrop.updates[updateIndex].telegramMessageId = telegramResult.messageId;

            // Save the airdrop again with the updated Telegram info
            await airdrop.save();
          }
        } catch (telegramError) {
          // Don't fail if Telegram notification fails
          console.error(`Error sending Telegram update notification: ${telegramError.message}`);
        }
      } else {
        console.log(`Skipping Telegram notification for airdrop update: ${airdrop.title} (skipTelegramNotification=${skipTelegramNotification})`);
      }

      return airdrop;
    } catch (error) {
      throw new Error(`Error adding update to airdrop: ${error.message}`);
    }
  }

  /**
   * Get airdrops by status
   * @param {string} status - Status to filter by
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of airdrops
   */
  async getAirdropsByStatus(status, options = {}) {
    return this.getAllAirdrops({ status }, options);
  }
}

module.exports = new AirdropService();
