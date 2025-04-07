const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the Telegram bot with the token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
let bot = null;

// Only initialize the bot if the token is available
if (token && token !== 'YOUR_TELEGRAM_BOT_TOKEN') {
  try {
    bot = new TelegramBot(token, { polling: false });
    console.log('Telegram bot initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error);
  }
} else {
  console.log('Telegram bot not initialized: No valid token provided');
}

/**
 * Format an airdrop object into a Telegram message
 * @param {Object} airdrop - The airdrop object
 * @returns {string} - Formatted message text
 */
const formatAirdropMessage = (airdrop) => {
  // Create a nicely formatted message with markdown
  let message = `🚀 *NEW AIRDROP ALERT* 🚀\n\n`;
  message += `*${airdrop.title}*\n\n`;
  message += `💰 *Token*: ${airdrop.token}\n`;
  message += `📝 *Description*: ${airdrop.description}\n`;
  message += `✅ *Criteria*: ${airdrop.criteria}\n`;
  message += `⏰ *Deadline*: ${airdrop.deadline}\n`;
  message += `🏷️ *Status*: ${airdrop.status}\n`;
  message += `💵 *Cost*: ${airdrop.costType}\n\n`;
  
  // Add links
  message += `🔗 *Link*: [Click here](${airdrop.link})\n`;
  
  if (airdrop.claimUrl) {
    message += `🎁 *Claim URL*: [Claim here](${airdrop.claimUrl})\n`;
  }
  
  // Add social links if available
  const socialLinks = [];
  if (airdrop.socialLinks.website) socialLinks.push(`[Website](${airdrop.socialLinks.website})`);
  if (airdrop.socialLinks.discord) socialLinks.push(`[Discord](${airdrop.socialLinks.discord})`);
  if (airdrop.socialLinks.twitter) socialLinks.push(`[Twitter](${airdrop.socialLinks.twitter})`);
  if (airdrop.socialLinks.telegram) socialLinks.push(`[Telegram](${airdrop.socialLinks.telegram})`);
  if (airdrop.socialLinks.github) socialLinks.push(`[GitHub](${airdrop.socialLinks.github})`);
  if (airdrop.socialLinks.instagram) socialLinks.push(`[Instagram](${airdrop.socialLinks.instagram})`);
  
  if (socialLinks.length > 0) {
    message += `\n📱 *Social Links*: ${socialLinks.join(' | ')}\n`;
  }
  
  // Add a footer with website link
  message += `\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com/airdrop/${airdrop.airdropId})`;
  
  return message;
};

/**
 * Send an airdrop to Telegram
 * @param {Object} airdrop - The airdrop object to send
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
const sendAirdropToTelegram = async (airdrop) => {
  if (!bot || !chatId || chatId === 'YOUR_TELEGRAM_CHAT_ID') {
    console.log('Telegram notification skipped: Bot not initialized or chat ID not set');
    return false;
  }
  
  try {
    const message = formatAirdropMessage(airdrop);
    
    // Send the message with markdown formatting
    await bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: false 
    });
    
    console.log(`Airdrop "${airdrop.title}" successfully posted to Telegram`);
    return true;
  } catch (error) {
    console.error('Error sending airdrop to Telegram:', error);
    return false;
  }
};

module.exports = {
  sendAirdropToTelegram
};
