const trackingService = require('../services/trackingService');
const logger = require('../utils/logger');

/**
 * @desc    Track an airdrop for a user
 * @route   POST /api/tracking/:id
 * @access  Private
 */
const trackAirdrop = async (req, res) => {
  try {
    const userId = req.user._id;
    const airdropId = req.params.id;
    
    const result = await trackingService.trackAirdrop(userId, airdropId);
    
    logger.info(`User ${userId} tracked airdrop ${airdropId}`);
    
    res.json(result);
  } catch (error) {
    logger.error(`Error tracking airdrop: ${error.message}`);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Untrack an airdrop for a user
 * @route   DELETE /api/tracking/:id
 * @access  Private
 */
const untrackAirdrop = async (req, res) => {
  try {
    const userId = req.user._id;
    const airdropId = req.params.id;
    
    const result = await trackingService.untrackAirdrop(userId, airdropId);
    
    logger.info(`User ${userId} untracked airdrop ${airdropId}`);
    
    res.json(result);
  } catch (error) {
    logger.error(`Error untracking airdrop: ${error.message}`);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all tracked airdrops for a user
 * @route   GET /api/tracking
 * @access  Private
 */
const getTrackedAirdrops = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const airdrops = await trackingService.getTrackedAirdrops(userId);
    
    res.json(airdrops);
  } catch (error) {
    logger.error(`Error getting tracked airdrops: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Check if an airdrop is tracked by a user
 * @route   GET /api/tracking/:id/check
 * @access  Private
 */
const isAirdropTracked = async (req, res) => {
  try {
    const userId = req.user._id;
    const airdropId = req.params.id;
    
    const isTracked = await trackingService.isAirdropTracked(userId, airdropId);
    
    res.json({ isTracked });
  } catch (error) {
    logger.error(`Error checking if airdrop is tracked: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackAirdrop,
  untrackAirdrop,
  getTrackedAirdrops,
  isAirdropTracked,
};
