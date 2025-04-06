const mongoose = require('mongoose');

const airdropSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    criteria: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'upcoming', 'ended'],
      default: 'upcoming',
    },
    link: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Airdrop = mongoose.model('Airdrop', airdropSchema);

module.exports = Airdrop;
