const express = require('express');
const router = express.Router();
const {
  getAirdrops,
  getAirdropById,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
  getAirdropsByStatus,
} = require('../controllers/airdropController');
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimitMiddleware');
const {
  createAirdropValidation,
  updateAirdropValidation,
  paginationValidation,
} = require('../middleware/validationMiddleware');

// Public routes with rate limiting
router.route('/')
  .get(apiLimiter, paginationValidation, getAirdrops);

router.route('/status/:status')
  .get(apiLimiter, paginationValidation, getAirdropsByStatus);

router.route('/:id')
  .get(apiLimiter, optionalAuth, getAirdropById);

// Protected admin routes - No validation for admin operations
router.route('/')
  .post(protect, admin, adminLimiter, createAirdrop);

router.route('/:id')
  .put(protect, admin, adminLimiter, updateAirdrop)
  .delete(protect, admin, adminLimiter, deleteAirdrop);

// Airdrop updates route
router.route('/:id/updates')
  .post(protect, admin, adminLimiter, (req, res) => {
    const { content, skipTelegramNotification, sendTelegramNotification } = req.body;

    // No validation for admin - just check if content exists
    if (!content) {
      return res.status(400).json({ message: 'Update content is required' });
    }

    // Call the airdrop service to add an update
    const airdropService = require('../services/airdropService');

    airdropService.addAirdropUpdate(req.params.id, content, { skipTelegramNotification, sendTelegramNotification })
      .then(updatedAirdrop => {
        res.json(updatedAirdrop);
      })
      .catch(error => {
        res.status(error.message.includes('not found') ? 404 : 500).json({ message: error.message });
      });
  });

module.exports = router;
