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
