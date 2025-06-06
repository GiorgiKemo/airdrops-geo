const config = require('../config');

// Determine which database to use based on environment variable
const useSupabase = process.env.USE_SUPABASE === 'true';

let User, Airdrop, PasswordResetToken, View, Tracking;

if (useSupabase) {
  // Use Supabase models
  User = require('./supabase/userModel');
  Airdrop = require('./supabase/airdropModel');
  PasswordResetToken = require('./supabase/passwordResetTokenModel');
  View = require('./supabase/viewModel');
  Tracking = require('./supabase/trackingModel');
  
  console.log('Using Supabase models');
} else {
  // Use MongoDB models
  User = require('./userModel');
  Airdrop = require('./airdropModel');
  PasswordResetToken = require('./passwordResetTokenModel');
  View = require('./viewModel');
  Tracking = require('./trackingModel');
  
  console.log('Using MongoDB models');
}

module.exports = {
  User,
  Airdrop,
  PasswordResetToken,
  View,
  Tracking
};
