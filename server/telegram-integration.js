const mongoose = require('mongoose');
const telegramService = require('./services/telegramService');

// Store the last time an airdrop was sent to Telegram
const lastSentTime = new Map();

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
        
        // Check if this is just a Telegram metadata update
        if (change.updateDescription && change.updateDescription.updatedFields) {
          const updatedFields = Object.keys(change.updateDescription.updatedFields);
          const onlyTelegramFieldsUpdated = updatedFields.every(field => 
            field.startsWith('telegram.') || field === 'updatedAt'
          );
          
          if (onlyTelegramFieldsUpdated) {
            if (logActivity) {
              console.log(`Skipping Telegram notification for airdrop ${airdrop.airdropId} - only Telegram metadata was updated`);
            }
            return; // Skip sending to Telegram
          }
        }
      }
      
      // Send the airdrop to Telegram
      if (airdrop) {
        // Implement debounce - don't send the same airdrop too frequently
        const airdropId = airdrop._id.toString();
        const now = Date.now();
        const lastSent = lastSentTime.get(airdropId) || 0;
        const debounceTime = 60000; // 1 minute in milliseconds
        
        if (now - lastSent < debounceTime) {
          if (logActivity) {
            console.log(`Skipping Telegram notification for airdrop ${airdrop.airdropId} - sent too recently (within ${debounceTime/1000} seconds)`);
          }
          return; // Skip sending to Telegram
        }
        
        // Update the last sent time
        lastSentTime.set(airdropId, now);
        
        // Determine if this is a new airdrop or an update
        const isUpdate = change.operationType === 'update';
        
        if (logActivity) {
          if (isUpdate) {
            console.log(`Sending airdrop update for "${airdrop.title}" to Telegram...`);
          } else {
            console.log(`Sending new airdrop "${airdrop.title}" to Telegram...`);
          }
        }
        
        let result;
        
        // For new airdrops, send as new
        if (!isUpdate) {
          result = await telegramService.sendAirdropToTelegram(airdrop);
          
          // If successful, store the message ID in the airdrop document
          if (result.success && result.messageId) {
            await Airdrop.findByIdAndUpdate(airdrop._id, {
              'telegram.messageId': result.messageId,
              'telegram.chatId': result.chatId,
              'telegram.lastUpdated': new Date()
            });
            
            if (logActivity) {
              console.log(`Stored Telegram message ID ${result.messageId} for airdrop ${airdrop.airdropId}`);
            }
          }
        }
        // For updates, send as update and reply to original message if possible
        else {
          // Check if this is a specific update (new update added to the updates array)
          let updateContent = null;
          let skipTelegramUpdate = false;
          
          if (change.updateDescription && change.updateDescription.updatedFields) {
            // Check if updates array was modified
            const updatedFields = Object.keys(change.updateDescription.updatedFields);
            const updatesFieldModified = updatedFields.some(field => field.startsWith('updates'));
            
            // If the update is just adding a telegramMessageId to an update, skip sending to Telegram
            // This happens when we explicitly send an update from the update button
            const onlyTelegramMessageIdUpdated = updatedFields.every(field => 
              field.includes('telegramMessageId') || field === 'updatedAt'
            );
            
            if (onlyTelegramMessageIdUpdated) {
              if (logActivity) {
                console.log(`Skipping Telegram notification - only telegramMessageId was updated`);
              }
              skipTelegramUpdate = true;
            }
            
            // If this is a regular update (not from the update button), get the content
            else if (updatesFieldModified && airdrop.updates && airdrop.updates.length > 0) {
              // Get the most recent update
              const latestUpdate = airdrop.updates[airdrop.updates.length - 1];
              
              // Skip if this update already has a telegramMessageId (means it was sent explicitly)
              if (latestUpdate.telegramMessageId) {
                if (logActivity) {
                  console.log(`Skipping Telegram notification - update already has telegramMessageId`);
                }
                skipTelegramUpdate = true;
              } else {
                updateContent = latestUpdate.content;
                
                if (logActivity) {
                  console.log(`Detected new update content: ${updateContent}`);
                }
              }
            }
          }
          
          // Only send to Telegram if we're not skipping
          if (!skipTelegramUpdate) {
            // Send the update to Telegram
            result = await telegramService.sendAirdropUpdateToTelegram(airdrop, { updateContent });
            
            // Store the Telegram message ID with the update if it was a specific update
            if (result.success && result.messageId && updateContent) {
              // Update the latest update with the Telegram message ID
              const updateIndex = airdrop.updates.length - 1;
              
              await Airdrop.findOneAndUpdate(
                { _id: airdrop._id, 'updates._id': airdrop.updates[updateIndex]._id },
                { $set: { 'updates.$.telegramMessageId': result.messageId } }
              );
              
              if (logActivity) {
                console.log(`Stored Telegram message ID ${result.messageId} for update`);
              }
            }
            // For regular updates, just update the lastUpdated timestamp
            else if (result.success && result.messageId) {
              await Airdrop.findByIdAndUpdate(airdrop._id, {
                'telegram.lastUpdated': new Date()
              });
              
              if (logActivity) {
                console.log(`Updated Telegram lastUpdated timestamp for airdrop ${airdrop.airdropId}`);
              }
            }
          }
          
          if (logActivity && result) {
            if (result.success) {
              console.log(`Successfully sent airdrop ${isUpdate ? 'update' : ''} "${airdrop.title}" to Telegram`);
            } else {
              console.log(`Failed to send airdrop ${isUpdate ? 'update' : ''} "${airdrop.title}" to Telegram`);
            }
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
