const express = require('express');
const router = express.Router();
const {
  trackAirdrop,
  untrackAirdrop,
  getTrackedAirdrops,
  isAirdropTracked,
} = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');
const { trackAirdropValidation } = require('../middleware/validationMiddleware');

// All routes are protected
router.route('/')
  .get(protect, apiLimiter, getTrackedAirdrops);

router.route('/:id')
  .post(protect, apiLimiter, trackAirdropValidation, trackAirdrop)
  .delete(protect, apiLimiter, trackAirdropValidation, untrackAirdrop);

router.route('/:id/check')
  .get(protect, apiLimiter, trackAirdropValidation, isAirdropTracked);

module.exports = router;
