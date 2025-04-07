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

// Explicitly define a non-unique index on airdropId
viewSchema.index({ airdropId: 1 }, { unique: false });

const View = mongoose.model('View', viewSchema);

module.exports = View;
