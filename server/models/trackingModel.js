const mongoose = require('mongoose');

const trackingSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    airdropIds: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
