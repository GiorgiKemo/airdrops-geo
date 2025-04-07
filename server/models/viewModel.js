const mongoose = require('mongoose');

const viewSchema = mongoose.Schema(
  {
    airdropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airdrop',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

const View = mongoose.model('View', viewSchema);

module.exports = View;
