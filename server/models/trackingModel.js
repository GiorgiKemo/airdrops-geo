const mongoose = require('mongoose');

const trackingSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    airdropIds: {
      type: [mongoose.Schema.Types.Mixed], // Accept both numbers and strings
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for userId (already has implicit index due to 'unique: true')
// Add index for airdropIds to improve performance when checking if an airdrop is tracked
trackingSchema.index({ 'airdropIds': 1 });

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
