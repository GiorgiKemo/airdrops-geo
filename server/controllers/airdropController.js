const airdropService = require('../services/airdropService');
const telegramService = require('../services/telegramService');
const logger = require('../utils/logger');

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

    // Get airdrops with filters and pagination
    const airdrops = await airdropService.getAllAirdrops(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    });

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
    const airdrop = await airdropService.getAirdropById(req.params.id);
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
    // Create the airdrop
    const airdrop = await airdropService.createAirdrop(req.body);

    // Send Telegram notification if enabled
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
    // Check if we should send a Telegram notification
    const sendTelegramNotification = req.body.sendTelegramNotification === true;
    const skipTelegramNotification = req.body.skipTelegramNotification === true;

    // Remove these flags from the update data
    const updateData = { ...req.body };
    delete updateData.sendTelegramNotification;
    delete updateData.skipTelegramNotification;

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
    await airdropService.deleteAirdrop(req.params.id);
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

    const airdrops = await airdropService.getAirdropsByStatus(status, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

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
