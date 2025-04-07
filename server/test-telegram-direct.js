const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get the token and chat ID from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('Telegram configuration:', {
  tokenProvided: !!token,
  tokenLength: token ? token.length : 0,
  chatIdProvided: !!chatId,
  chatIdValue: chatId
});

// Create a bot instance
const bot = new TelegramBot(token, { polling: false });

// Send a test message
async function sendTestMessage() {
  try {
    console.log(`Sending test message to chat ID: ${chatId}`);
    const message = '🚀 *TEST MESSAGE* 🚀\n\nThis is a test message from the Airdrops Geo server.';
    
    const result = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
    
    console.log('Message sent successfully!');
    console.log('Message ID:', result.message_id);
    console.log('Chat ID:', result.chat.id);
    console.log('Message text:', result.text);
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.response) {
      console.error('Telegram API response:', error.response.body);
    }
    return false;
  }
}

// Run the test
sendTestMessage();
