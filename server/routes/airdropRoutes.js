const express = require('express');
const router = express.Router();
const {
  getAirdrops,
  getAirdropById,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
} = require('../controllers/airdropController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getAirdrops);
router.route('/:id').get(getAirdropById);

// Protected admin routes
router.route('/').post(protect, admin, createAirdrop);
router.route('/:id').put(protect, admin, updateAirdrop).delete(protect, admin, deleteAirdrop);

module.exports = router;
