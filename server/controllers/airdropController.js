const airdropService = require('../services/airdropService');
const telegramService = require('../services/telegramService');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * @desc    Get all airdrops with filtering and pagination
 * @route   GET /api/airdrops
 * @access  Public
 */
const getAirdrops = async (req, res) => {
  try {
    // Extract query parameters
    const {
      status,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    // Build filters
    const filters = {};

    // Add status filter if provided
    if (status) {
      filters.status = status;
    }

    // Add search filter if provided
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { token: { $regex: search, $options: 'i' } },
      ];
    }

    // Create a cache key based on the request parameters
    const cacheKey = `airdrops:${JSON.stringify({
      filters,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    })}`;

    // Get data from cache or database
    const airdrops = await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.debug(`Cache miss for ${cacheKey}, fetching from database`);
        return airdropService.getAllAirdrops(filters, {
          page: parseInt(page),
          limit: parseInt(limit),
          sortBy,
          sortOrder: parseInt(sortOrder)
        });
      },
      // Cache for 5 minutes for most queries, but longer for common queries like all active airdrops
      status === 'active' && !search ? 60 * 15 : 60 * 5
    );

    res.json(airdrops);
  } catch (error) {
    logger.error(`Error getting airdrops: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single airdrop
 * @route   GET /api/airdrops/:id
 * @access  Public
 */
const getAirdropById = async (req, res) => {
  try {
    const airdropId = req.params.id;
    const cacheKey = `airdrop:${airdropId}`;

    // Get airdrop from cache or database
    const airdrop = await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.debug(`Cache miss for ${cacheKey}, fetching from database`);
        return airdropService.getAirdropById(airdropId);
      },
      // Cache individual airdrops for 30 minutes
      60 * 30
    );

    res.json(airdrop);
  } catch (error) {
    logger.error(`Error getting airdrop by ID: ${error.message}`);

    if (error.message === 'Airdrop not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new airdrop
 * @route   POST /api/airdrops
 * @access  Private/Admin
 */
const createAirdrop = async (req, res) => {
  try {
    // Check if we should skip Telegram notification
    const skipTelegramNotification = req.body.skipTelegramNotification === true;

    // Create the airdrop
    const airdrop = await airdropService.createAirdrop(req.body);

    // Send Telegram notification if enabled and not explicitly skipped
    if (!skipTelegramNotification) {
      try {
        logger.info(`Sending Telegram notification for new airdrop: ${airdrop.title}`);
        const telegramResult = await telegramService.sendAirdropToTelegram(airdrop);

        // If successful, store the message ID in the airdrop document
        if (telegramResult && telegramResult.success && telegramResult.messageId) {
          await airdropService.updateAirdrop(airdrop._id, {
            'telegram.messageId': telegramResult.messageId,
            'telegram.chatId': telegramResult.chatId,
            'telegram.lastUpdated': new Date()
          });

          logger.info(`Stored Telegram message ID ${telegramResult.messageId} for airdrop ${airdrop.airdropId}`);
        }
      } catch (telegramError) {
        // Don't fail the request if Telegram notification fails
        logger.error(`Error sending Telegram notification: ${telegramError.message}`);
      }
    } else {
      logger.info(`Skipping Telegram notification for new airdrop: ${airdrop.title} (skipTelegramNotification=true)`);
    }

    // Invalidate airdrops list cache after creating a new airdrop
    await cacheService.invalidate('airdrops:*');

    res.status(201).json(airdrop);
  } catch (error) {
    logger.error(`Error creating airdrop: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update an airdrop
 * @route   PUT /api/airdrops/:id
 * @access  Private/Admin
 */
const updateAirdrop = async (req, res) => {
  try {
    // First get the current airdrop to check its existing flags
    const existingAirdrop = await airdropService.getAirdropById(req.params.id);

    // Check if we should send a Telegram notification
    // Only send notifications when explicitly requested with sendTelegramNotification=true
    // Default to false for all other updates (including status changes)
    const sendTelegramNotification = req.body.sendTelegramNotification === true;
    const skipTelegramNotification = req.body.skipTelegramNotification === true || existingAirdrop.skipTelegramNotification === true;

    // Remove these flags from the update data
    const updateData = { ...req.body };
    delete updateData.sendTelegramNotification;

    // Keep the skipTelegramNotification flag in the document if it was true
    if (!skipTelegramNotification) {
      delete updateData.skipTelegramNotification;
    }

    // Update the airdrop
    const airdrop = await airdropService.updateAirdrop(req.params.id, updateData);

    // Send Telegram notification if requested and not explicitly skipped
    if (sendTelegramNotification && !skipTelegramNotification) {
      try {
        logger.info(`Sending Telegram update notification for airdrop: ${airdrop.title}`);

        // Check if there's a specific update message
        let updateContent = null;
        if (airdrop.updates && airdrop.updates.length > 0) {
          // Get the most recent update
          const latestUpdate = airdrop.updates[airdrop.updates.length - 1];
          updateContent = latestUpdate.content;
        }

        // Send the notification
        const telegramResult = await telegramService.sendAirdropUpdateToTelegram(
          airdrop,
          { updateContent: updateContent || `Status updated to: ${airdrop.status}`, isExplicitUpdate: true }
        );

        // If successful and we have an update, store the message ID
        if (telegramResult.success && telegramResult.messageId && updateContent) {
          // Update the latest update with the Telegram message ID
          const updates = [...airdrop.updates];
          if (updates.length > 0) {
            updates[updates.length - 1].telegramMessageId = telegramResult.messageId;

            await airdropService.updateAirdrop(airdrop._id, { updates });

            logger.info(`Stored Telegram message ID ${telegramResult.messageId} for airdrop update`);
          }
        }
      } catch (telegramError) {
        // Don't fail the request if Telegram notification fails
        logger.error(`Error sending Telegram update notification: ${telegramError.message}`);
      }
    }

    // Invalidate both the specific airdrop cache and the airdrops list cache
    await Promise.all([
      cacheService.del(`airdrop:${req.params.id}`),
      cacheService.invalidate('airdrops:*')
    ]);

    res.json(airdrop);
  } catch (error) {
    logger.error(`Error updating airdrop: ${error.message}`);

    if (error.message === 'Airdrop not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete an airdrop
 * @route   DELETE /api/airdrops/:id
 * @access  Private/Admin
 */
const deleteAirdrop = async (req, res) => {
  try {
    const airdropId = req.params.id;
    await airdropService.deleteAirdrop(airdropId);

    // Invalidate both the specific airdrop cache and the airdrops list cache
    await Promise.all([
      cacheService.del(`airdrop:${airdropId}`),
      cacheService.invalidate('airdrops:*')
    ]);

    res.json({ message: 'Airdrop removed successfully' });
  } catch (error) {
    logger.error(`Error deleting airdrop: ${error.message}`);

    if (error.message === 'Airdrop not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get airdrops by status
 * @route   GET /api/airdrops/status/:status
 * @access  Public
 */
const getAirdropsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Create a cache key based on the request parameters
    const cacheKey = `airdrops:status:${status}:${page}:${limit}`;

    // Get data from cache or database
    const airdrops = await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.debug(`Cache miss for ${cacheKey}, fetching from database`);
        return airdropService.getAirdropsByStatus(status, {
          page: parseInt(page),
          limit: parseInt(limit)
        });
      },
      // Cache for 10 minutes
      60 * 10
    );

    res.json(airdrops);
  } catch (error) {
    logger.error(`Error getting airdrops by status: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAirdrops,
  getAirdropById,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
  getAirdropsByStatus,
};
