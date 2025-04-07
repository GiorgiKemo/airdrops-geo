const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Airdrop = require('./models/airdropModel');
const telegramService = require('./services/telegramService');

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Store the last checked timestamp
let lastCheckedTime = new Date();
console.log(`Starting monitor at: ${lastCheckedTime.toISOString()}`);

// Check for new airdrops
async function checkForNewAirdrops() {
  try {
    console.log(`\nChecking for airdrops created after: ${lastCheckedTime.toISOString()}`);
    
    // Find airdrops created after the last check time
    const newAirdrops = await Airdrop.find({
      createdAt: { $gt: lastCheckedTime }
    }).sort({ createdAt: 1 });
    
    console.log(`Found ${newAirdrops.length} new airdrops`);
    
    // Process each new airdrop
    for (const airdrop of newAirdrops) {
      console.log(`\nProcessing airdrop: ${airdrop.title} (ID: ${airdrop.airdropId})`);
      console.log(`Created at: ${airdrop.createdAt}`);
      
      // Send to Telegram
      try {
        console.log('Sending to Telegram...');
        const result = await telegramService.sendAirdropToTelegram(airdrop);
        console.log(`Sent to Telegram. Result: ${result}`);
      } catch (error) {
        console.error('Error sending to Telegram:', error.message);
      }
    }
    
    // Update the last checked time if we found any airdrops
    if (newAirdrops.length > 0) {
      lastCheckedTime = new Date();
      console.log(`Updated last checked time to: ${lastCheckedTime.toISOString()}`);
    }
  } catch (error) {
    console.error('Error checking for new airdrops:', error);
  }
}

// Main function
async function main() {
  const connected = await connectDB();
  if (connected) {
    // Run the check immediately
    await checkForNewAirdrops();
    
    // Then run it every 10 seconds
    console.log('\nMonitoring for new airdrops every 10 seconds...');
    console.log('Press Ctrl+C to stop');
    
    setInterval(checkForNewAirdrops, 10000);
  }
}

// Run the main function
main();
