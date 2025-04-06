const express = require('express');
const router = express.Router();
const {
  getAirdrops,
  getAirdropById,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
} = require('../controllers/airdropController');

router.route('/').get(getAirdrops).post(createAirdrop);
router.route('/:id').get(getAirdropById).put(updateAirdrop).delete(deleteAirdrop);

module.exports = router;
