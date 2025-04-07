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

// Get the most recent airdrop and send it to Telegram
async function sendRecentAirdrop() {
  try {
    // Get the most recent airdrop
    const airdrop = await Airdrop.findOne().sort({ createdAt: -1 });
    
    if (!airdrop) {
      console.log('No airdrops found');
      return;
    }
    
    console.log('Found most recent airdrop:');
    console.log(`ID: ${airdrop._id}`);
    console.log(`Airdrop ID: ${airdrop.airdropId}`);
    console.log(`Title: ${airdrop.title}`);
    console.log(`Created: ${airdrop.createdAt}`);
    
    // Send the airdrop to Telegram
    console.log('\nAttempting to send this airdrop to Telegram...');
    const result = await telegramService.sendAirdropToTelegram(airdrop);
    console.log('Telegram result:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main function
async function main() {
  const connected = await connectDB();
  if (connected) {
    await sendRecentAirdrop();
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the main function
main();
