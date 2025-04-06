const mongoose = require('mongoose');

const viewSchema = mongoose.Schema(
  {
    airdropId: {
      type: Number,
      required: true,
      unique: true,
    },
    ipAddresses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const View = mongoose.model('View', viewSchema);

module.exports = View;
