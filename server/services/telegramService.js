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
  try {
    // Create a nicely formatted message with markdown
    let message = `🚀 *NEW AIRDROP ALERT* 🚀\n\n`;
    message += `*${airdrop.title}*\n\n`;

    // Only add fields that have values
    if (airdrop.token) message += `💰 *Token*: ${airdrop.token}\n`;
    if (airdrop.description) message += `📝 *Description*: ${airdrop.description}\n`;
    if (airdrop.criteria) message += `✅ *Criteria*: ${airdrop.criteria}\n`;
    if (airdrop.deadline) message += `⏰ *Deadline*: ${airdrop.deadline}\n`;
    if (airdrop.status) message += `🏷️ *Status*: ${airdrop.status}\n`;
    if (airdrop.costType) message += `💵 *Cost*: ${airdrop.costType}\n`;

    message += `\n`; // Add an extra line break

    // Add links
    if (airdrop.link) {
      message += `🔗 *Link*: [Click here](${airdrop.link})\n`;
    }

    if (airdrop.claimUrl) {
      message += `🎁 *Claim URL*: [Claim here](${airdrop.claimUrl})\n`;
    }

    // Add social links if available
    const socialLinks = [];
    if (airdrop.socialLinks?.website) socialLinks.push(`[Website](${airdrop.socialLinks.website})`);
    if (airdrop.socialLinks?.discord) socialLinks.push(`[Discord](${airdrop.socialLinks.discord})`);
    if (airdrop.socialLinks?.twitter) socialLinks.push(`[Twitter](${airdrop.socialLinks.twitter})`);
    if (airdrop.socialLinks?.telegram) socialLinks.push(`[Telegram](${airdrop.socialLinks.telegram})`);
    if (airdrop.socialLinks?.github) socialLinks.push(`[GitHub](${airdrop.socialLinks.github})`);
    if (airdrop.socialLinks?.instagram) socialLinks.push(`[Instagram](${airdrop.socialLinks.instagram})`);

    if (socialLinks.length > 0) {
      message += `\n📱 *Social Links*: ${socialLinks.join(' | ')}\n`;
    }

    // Add a footer with website link
    if (airdrop.airdropId) {
      message += `\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com/airdrop/${airdrop.airdropId})`;
    } else {
      message += `\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com)`;
    }

    return message;
  } catch (error) {
    console.error('Error formatting Telegram message:', error);
    // Return a simple fallback message
    return `🚀 *NEW AIRDROP ALERT* 🚀\n\n*${airdrop.title || 'New Airdrop'}*\n\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com)`;
  }
};

/**
 * Send an airdrop to Telegram
 * @param {Object} airdrop - The airdrop object to send
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
const sendAirdropToTelegram = async (airdrop) => {
  console.log('Attempting to send airdrop to Telegram:', {
    botInitialized: !!bot,
    chatIdProvided: !!chatId,
    chatIdValue: chatId,
    airdropTitle: airdrop?.title || 'No title'
  });

  if (!bot || !chatId || chatId === 'YOUR_TELEGRAM_CHAT_ID') {
    console.log('Telegram notification skipped: Bot not initialized or chat ID not set');
    return false;
  }

  try {
    // Make sure airdrop has all required fields with fallbacks
    const safeAirdrop = {
      airdropId: airdrop.airdropId || 0,
      title: airdrop.title || 'New Airdrop',
      description: airdrop.description || 'No description provided',
      token: airdrop.token || 'Unknown',
      criteria: airdrop.criteria || 'No criteria specified',
      deadline: airdrop.deadline || 'Not specified',
      startDate: airdrop.startDate || 'Not specified',
      status: airdrop.status || 'Unknown',
      costType: airdrop.costType || 'Unknown',
      link: airdrop.link || 'https://airdrops-geo.onrender.com',
      claimUrl: airdrop.claimUrl || '',
      logoUrl: airdrop.logoUrl || '',
      socialLinks: airdrop.socialLinks || {}
    };

    const message = formatAirdropMessage(safeAirdrop);
    console.log('Formatted Telegram message:', message.substring(0, 100) + '...');

    // Send the message with markdown formatting
    console.log(`Sending to Telegram chat ID: ${chatId}`);
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });

    console.log(`Airdrop "${safeAirdrop.title}" successfully posted to Telegram`);
    return true;
  } catch (error) {
    console.error('Error sending airdrop to Telegram:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendAirdropToTelegram
};
