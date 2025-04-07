const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Airdrop = require('./models/airdropModel');

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

// Get all airdrops
async function getAllAirdrops() {
  try {
    const airdrops = await Airdrop.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${airdrops.length} airdrops`);
    
    // Print the most recent airdrops
    console.log('\nMost recent airdrops:');
    airdrops.forEach((airdrop, index) => {
      console.log(`\n--- Airdrop ${index + 1} ---`);
      console.log(`ID: ${airdrop._id}`);
      console.log(`Airdrop ID: ${airdrop.airdropId}`);
      console.log(`Title: ${airdrop.title}`);
      console.log(`Created: ${airdrop.createdAt}`);
      console.log(`Updated: ${airdrop.updatedAt}`);
      console.log(`Status: ${airdrop.status}`);
      console.log(`Token: ${airdrop.token}`);
    });
    
    // Check if there's an airdrop with title containing "check"
    const checkAirdrop = airdrops.find(airdrop => 
      airdrop.title.toLowerCase().includes('check')
    );
    
    if (checkAirdrop) {
      console.log('\n=== Found "check" airdrop ===');
      console.log(`ID: ${checkAirdrop._id}`);
      console.log(`Airdrop ID: ${checkAirdrop.airdropId}`);
      console.log(`Title: ${checkAirdrop.title}`);
      console.log(`Created: ${checkAirdrop.createdAt}`);
      console.log(`Updated: ${checkAirdrop.updatedAt}`);
      console.log(`Status: ${checkAirdrop.status}`);
      console.log(`Token: ${checkAirdrop.token}`);
      
      // Try to send this airdrop to Telegram
      const telegramService = require('./services/telegramService');
      console.log('\nAttempting to send this airdrop to Telegram...');
      const result = await telegramService.sendAirdropToTelegram(checkAirdrop);
      console.log('Telegram result:', result);
    } else {
      console.log('\nNo airdrop with title containing "check" found');
    }
    
  } catch (error) {
    console.error('Error getting airdrops:', error);
  }
}

// Main function
async function main() {
  const connected = await connectDB();
  if (connected) {
    await getAllAirdrops();
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the main function
main();
