const mongoose = require('mongoose');

const airdropSchema = mongoose.Schema(
  {
    airdropId: {
      type: Number,
      unique: true,
    },
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
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'upcoming', 'ended', 'claim'],
      default: 'upcoming',
    },
    costType: {
      type: String,
      default: 'free',
    },
    link: {
      type: String,
      required: true,
    },
    claimUrl: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    cardColor: {
      type: String,
      default: '',
    },
    predefinedColor: {
      type: String,
      default: 'default',
    },
    socialLinks: {
      website: { type: String, default: '' },
      discord: { type: String, default: '' },
      twitter: { type: String, default: '' },
      telegram: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    views: {
      type: Number,
      default: 0,
    },
    telegram: {
      messageId: { type: Number, default: null },
      chatId: { type: String, default: null },
      lastUpdated: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const Airdrop = mongoose.model('Airdrop', airdropSchema);

module.exports = Airdrop;
