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
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
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

// Protected admin routes
router.route('/')
  .post(protect, admin, createAirdropValidation, createAirdrop);

router.route('/:id')
  .put(protect, admin, updateAirdropValidation, updateAirdrop)
  .delete(protect, admin, deleteAirdrop);

module.exports = router;
