const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get the token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
  console.error('Please set a valid TELEGRAM_BOT_TOKEN in your .env file');
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log('Bot started. Please follow these steps:');
console.log('1. Add your bot to your channel or group as an admin');
console.log('2. Send a message in the channel or group');
console.log('3. The bot will print the chat ID');
console.log('4. Press Ctrl+C to stop the bot after you get the chat ID');

// Listen for any message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const chatTitle = msg.chat.title || 'Private Chat';
  
  console.log(`\n=== CHAT INFORMATION ===`);
  console.log(`Chat ID: ${chatId}`);
  console.log(`Chat Type: ${chatType}`);
  console.log(`Chat Title: ${chatTitle}`);
  console.log(`\nUpdate your .env file with:`);
  console.log(`TELEGRAM_CHAT_ID=${chatId}`);
  console.log(`===========================\n`);
  
  // Reply to the message to confirm
  bot.sendMessage(chatId, `I found this chat! The chat ID is: ${chatId}`);
});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Waiting for messages...');
