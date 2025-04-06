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

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
