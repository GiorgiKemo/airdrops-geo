require('dotenv').config();
const mongoose = require('mongoose');
const { supabase } = require('../config/supabase');
const connectDB = require('../config/db');
const User = require('../models/userModel');
const Airdrop = require('../models/airdropModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const View = require('../models/viewModel');
const Tracking = require('../models/trackingModel');
const logger = require('../utils/logger');

// Function to migrate users
async function migrateUsers() {
  logger.info('Starting user migration...');
  const users = await User.find({});
  
  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user._id.toString(), // Use MongoDB _id as UUID
        username: user.username,
        email: user.email,
        password: user.password, // Already hashed from MongoDB
        role: user.role,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      });
      
    if (error) {
      logger.error(`Error migrating user ${user._id}: ${error.message}`);
    } else {
      logger.info(`Migrated user: ${user.username}`);
    }
  }
  
  logger.info(`User migration completed. Migrated ${users.length} users.`);
}

// Function to migrate airdrops
async function migrateAirdrops() {
  logger.info('Starting airdrop migration...');
  const airdrops = await Airdrop.find({});
  
  for (const airdrop of airdrops) {
    // Insert airdrop
    const { data: airdropData, error: airdropError } = await supabase
      .from('airdrops')
      .insert({
        id: airdrop._id.toString(),
        airdrop_id: airdrop.airdropId,
        title: airdrop.title,
        description: airdrop.description,
        token: airdrop.token,
        criteria: airdrop.criteria,
        start_date: airdrop.startDate,
        deadline: airdrop.deadline,
        status: airdrop.status,
        cost_type: airdrop.costType,
        link: airdrop.link,
        claim_url: airdrop.claimUrl,
        logo_url: airdrop.logoUrl,
        card_color: airdrop.cardColor,
        predefined_color: airdrop.predefinedColor,
        views: airdrop.views,
        skip_telegram_notification: airdrop.skipTelegramNotification,
        created_at: airdrop.createdAt,
        updated_at: airdrop.updatedAt
      })
      .select('id');
      
    if (airdropError) {
      logger.error(`Error migrating airdrop ${airdrop._id}: ${airdropError.message}`);
      continue;
    }
    
    // Insert social links
    if (airdrop.socialLinks) {
      const { error: socialLinksError } = await supabase
        .from('social_links')
        .insert({
          airdrop_id: airdrop._id.toString(),
          website: airdrop.socialLinks.website || '',
          discord: airdrop.socialLinks.discord || '',
          twitter: airdrop.socialLinks.twitter || '',
          telegram: airdrop.socialLinks.telegram || '',
          github: airdrop.socialLinks.github || '',
          instagram: airdrop.socialLinks.instagram || ''
        });
        
      if (socialLinksError) {
        logger.error(`Error migrating social links for airdrop ${airdrop._id}: ${socialLinksError.message}`);
      }
    }
    
    // Insert telegram info
    if (airdrop.telegram) {
      const { error: telegramError } = await supabase
        .from('telegram_info')
        .insert({
          airdrop_id: airdrop._id.toString(),
          message_id: airdrop.telegram.messageId,
          chat_id: airdrop.telegram.chatId,
          last_updated: airdrop.telegram.lastUpdated
        });
        
      if (telegramError) {
        logger.error(`Error migrating telegram info for airdrop ${airdrop._id}: ${telegramError.message}`);
      }
    }
    
    // Insert updates
    if (airdrop.updates && airdrop.updates.length > 0) {
      const updates = airdrop.updates.map(update => ({
        airdrop_id: airdrop._id.toString(),
        content: update.content,
        telegram_message_id: update.telegramMessageId,
        created_at: update.date
      }));
      
      const { error: updatesError } = await supabase
        .from('airdrop_updates')
        .insert(updates);
        
      if (updatesError) {
        logger.error(`Error migrating updates for airdrop ${airdrop._id}: ${updatesError.message}`);
      }
    }
    
    logger.info(`Migrated airdrop: ${airdrop.title}`);
  }
  
  logger.info(`Airdrop migration completed. Migrated ${airdrops.length} airdrops.`);
}

// Function to migrate password reset tokens
async function migratePasswordResetTokens() {
  logger.info('Starting password reset token migration...');
  const tokens = await PasswordResetToken.find({});
  
  for (const token of tokens) {
    const { error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: token.userId.toString(),
        token: token.token,
        created_at: token.createdAt,
        expires_at: new Date(token.createdAt.getTime() + 3600000) // 1 hour from creation
      });
      
    if (error) {
      logger.error(`Error migrating password reset token: ${error.message}`);
    }
  }
  
  logger.info(`Password reset token migration completed. Migrated ${tokens.length} tokens.`);
}

// Function to migrate views
async function migrateViews() {
  logger.info('Starting views migration...');
  const views = await View.find({});
  
  // Batch insert views in chunks to avoid hitting limits
  const chunkSize = 1000;
  for (let i = 0; i < views.length; i += chunkSize) {
    const chunk = views.slice(i, i + chunkSize);
    
    const viewsToInsert = chunk.map(view => ({
      airdrop_id: view.airdropId.toString(),
      ip_address: view.ipAddress || '',
      created_at: view.timestamp || view.createdAt
    }));
    
    const { error } = await supabase
      .from('views')
      .insert(viewsToInsert);
      
    if (error) {
      logger.error(`Error migrating views chunk ${i}-${i+chunk.length}: ${error.message}`);
    } else {
      logger.info(`Migrated views chunk ${i}-${i+chunk.length}`);
    }
  }
  
  logger.info(`Views migration completed. Migrated ${views.length} views.`);
}

// Function to migrate tracking data
async function migrateTracking() {
  logger.info('Starting tracking data migration...');
  const trackingData = await Tracking.find({});
  
  for (const tracking of trackingData) {
    const { error } = await supabase
      .from('tracking')
      .insert({
        user_id: tracking.userId,
        airdrop_ids: tracking.airdropIds,
        created_at: tracking.createdAt,
        updated_at: tracking.updatedAt
      });
      
    if (error) {
      logger.error(`Error migrating tracking data for user ${tracking.userId}: ${error.message}`);
    }
  }
  
  logger.info(`Tracking data migration completed. Migrated ${trackingData.length} records.`);
}

// Main migration function
async function migrateToSupabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Run migrations
    await migrateUsers();
    await migrateAirdrops();
    await migratePasswordResetTokens();
    await migrateViews();
    await migrateTracking();
    
    logger.info('Migration to Supabase completed successfully!');
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  }
}

// Run the migration
migrateToSupabase();
