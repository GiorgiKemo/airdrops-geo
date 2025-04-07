const mongoose = require('mongoose');
const telegramService = require('./services/telegramService');

/**
 * Set up a MongoDB change stream to watch for new or updated airdrops
 * and send them to Telegram
 * @param {Object} options - Configuration options
 * @param {boolean} options.watchForUpdates - Whether to watch for updates to existing airdrops
 * @param {boolean} options.logActivity - Whether to log activity to the console
 * @returns {Object} - The change stream object
 */
function setupTelegramIntegration(options = {}) {
  const { 
    watchForUpdates = true, 
    logActivity = true 
  } = options;
  
  // Get the Airdrop model
  const Airdrop = mongoose.model('Airdrop');
  
  if (logActivity) {
    console.log('Setting up Telegram integration with MongoDB Change Streams');
  }
  
  // Create a pipeline that watches for new or updated airdrops
  const pipeline = [
    {
      $match: {
        operationType: { $in: ['insert', ...(watchForUpdates ? ['update'] : [])] }
      }
    }
  ];
  
  // Create the change stream
  const changeStream = Airdrop.watch(pipeline);
  
  // Handle change events
  changeStream.on('change', async (change) => {
    try {
      if (logActivity) {
        console.log(`Detected ${change.operationType} operation on airdrop`);
      }
      
      let airdrop;
      
      // Handle insert operations
      if (change.operationType === 'insert') {
        airdrop = change.fullDocument;
        if (logActivity) {
          console.log(`New airdrop created: ${airdrop.title} (ID: ${airdrop.airdropId})`);
        }
      }
      
      // Handle update operations
      else if (change.operationType === 'update') {
        // Get the updated document
        const airdropId = change.documentKey._id;
        airdrop = await Airdrop.findById(airdropId);
        if (logActivity) {
          console.log(`Airdrop updated: ${airdrop.title} (ID: ${airdrop.airdropId})`);
        }
      }
      
      // Send the airdrop to Telegram
      if (airdrop) {
        if (logActivity) {
          console.log(`Sending airdrop "${airdrop.title}" to Telegram...`);
        }
        
        const result = await telegramService.sendAirdropToTelegram(airdrop);
        
        if (logActivity) {
          if (result) {
            console.log(`Successfully sent airdrop "${airdrop.title}" to Telegram`);
          } else {
            console.log(`Failed to send airdrop "${airdrop.title}" to Telegram`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing change event:', error);
    }
  });
  
  // Handle errors
  changeStream.on('error', (error) => {
    console.error('Error in change stream:', error);
  });
  
  if (logActivity) {
    console.log('Telegram integration set up successfully');
  }
  
  return changeStream;
}

module.exports = setupTelegramIntegration;
