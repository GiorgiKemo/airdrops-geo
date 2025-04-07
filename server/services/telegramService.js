const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log all environment variables (for debugging)
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  TELEGRAM_BOT_TOKEN_EXISTS: !!process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID_EXISTS: !!process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_BOT_TOKEN_LENGTH: process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.length : 0,
  CURRENT_DIR: __dirname
});

// Initialize the Telegram bot with hardcoded token and chat ID
// This is not ideal, but it's a workaround for the environment variables issue
const token = process.env.TELEGRAM_BOT_TOKEN || '7287756066:AAHAcC4sBA7H8VH9BQiWGF4lNEaN37Oiz-o';
const chatId = process.env.TELEGRAM_CHAT_ID || '-1002562120618';
let bot = null;

// Log the Telegram configuration
console.log('Telegram configuration:', {
  tokenProvided: !!token,
  tokenLength: token ? token.length : 0,
  chatIdProvided: !!chatId,
  chatIdValue: chatId
});

// Always initialize the bot with the hardcoded token
try {
  console.log(`Initializing Telegram bot with token: ${token.substring(0, 5)}...${token.substring(token.length - 5)}`);
  console.log(`Using chat ID: ${chatId}`);

  // Force the bot to be initialized
  bot = new TelegramBot(token, { polling: false });
  console.log('Telegram bot initialized successfully');

  // Log success but don't send a test message
  console.log(`Telegram bot ready to send messages to chat ID: ${chatId}`);

} catch (error) {
  console.error('Failed to initialize Telegram bot:', error);
  console.error('Error details:', error.message);
  console.error('Error stack:', error.stack);
  bot = null; // Reset bot to null if initialization fails
}

/**
 * Format an airdrop object into a Telegram message
 * @param {Object} airdrop - The airdrop object
 * @param {boolean} isUpdate - Whether this is an update to an existing airdrop
 * @returns {string} - Formatted message text
 */
const formatAirdropMessage = (airdrop, isUpdate = false) => {
  try {
    // Create a nicely formatted message with markdown
    let message = isUpdate
      ? `📢 *AIRDROP UPDATE* 📢\n\n`
      : `🚀 *NEW AIRDROP ALERT* 🚀\n\n`;
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
    if (airdrop._id) {
      message += `\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com/airdrops/${airdrop._id})`;
    } else {
      message += `\n🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com)`;
    }

    return message;
  } catch (error) {
    console.error('Error formatting Telegram message:', error);
    // Return a simple fallback message
    const alertType = isUpdate ? 'AIRDROP UPDATE' : 'NEW AIRDROP ALERT';
    const emoji = isUpdate ? '📢' : '🚀';
    const viewUrl = airdrop._id
      ? `https://airdrops-geo.onrender.com/airdrops/${airdrop._id}`
      : 'https://airdrops-geo.onrender.com';
    return `${emoji} *${alertType}* ${emoji}\n\n*${airdrop.title || 'Airdrop'}*\n\n🌐 *View on Airdrops-Geo*: [Click here](${viewUrl})`;
  }
};

/**
 * Create a safe airdrop object with fallbacks for missing fields
 * @param {Object} airdrop - The original airdrop object
 * @returns {Object} - A safe airdrop object with fallbacks
 */
const createSafeAirdrop = (airdrop) => {
  return {
    _id: airdrop._id || null,
    airdropId: airdrop.airdropId || 0,
    title: airdrop.title || 'Airdrop',
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
    socialLinks: airdrop.socialLinks || {},
    telegram: airdrop.telegram || { messageId: null, chatId: null, lastUpdated: null }
  };
};

/**
 * Send a new airdrop to Telegram
 * @param {Object} airdrop - The airdrop object to send
 * @returns {Promise<Object>} - Result object with success status and message ID
 */
const sendAirdropToTelegram = async (airdrop) => {
  console.log('Attempting to send new airdrop to Telegram:', {
    botInitialized: !!bot,
    chatIdProvided: !!chatId,
    chatIdValue: chatId,
    airdropTitle: airdrop?.title || 'No title'
  });

  // Always try to send the notification, even if the bot wasn't initialized
  if (!bot) {
    console.log('Attempting to initialize Telegram bot for sending notification');
    try {
      bot = new TelegramBot(token, { polling: false });
      console.log('Telegram bot initialized successfully for sending notification');
    } catch (error) {
      console.error('Failed to initialize Telegram bot for sending notification:', error.message);
      return { success: false, messageId: null, error: 'Failed to initialize bot' };
    }
  }

  if (!chatId) {
    console.log('Telegram notification skipped: Chat ID not set');
    return { success: false, messageId: null, error: 'Chat ID not set' };
  }

  try {
    // Make sure airdrop has all required fields with fallbacks
    const safeAirdrop = createSafeAirdrop(airdrop);

    const message = formatAirdropMessage(safeAirdrop, false); // false = not an update
    console.log('Formatted Telegram message:', message.substring(0, 100) + '...');

    // Send the message with markdown formatting
    console.log(`Sending to Telegram chat ID: ${chatId}`);
    const sentMessage = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });

    console.log(`Airdrop "${safeAirdrop.title}" successfully posted to Telegram with message ID: ${sentMessage.message_id}`);
    return {
      success: true,
      messageId: sentMessage.message_id,
      chatId: chatId
    };
  } catch (error) {
    console.error('Error sending airdrop to Telegram:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.body);
    }
    return { success: false, messageId: null };
  }
};

/**
 * Send an airdrop update to Telegram
 * @param {Object} airdrop - The updated airdrop object
 * @param {Object} options - Additional options
 * @param {string} options.updateContent - Specific update content to send (optional)
 * @param {boolean} options.isExplicitUpdate - Whether this is an explicit update from the update button
 * @returns {Promise<Object>} - Result object with success status and message ID
 */
const sendAirdropUpdateToTelegram = async (airdrop, options = {}) => {
  const { updateContent, isExplicitUpdate = false } = options;
  const isSpecificUpdate = !!updateContent;

  console.log('Attempting to send airdrop update to Telegram:', {
    botInitialized: !!bot,
    chatIdProvided: !!chatId,
    chatIdValue: chatId,
    airdropTitle: airdrop?.title || 'No title',
    originalMessageId: airdrop?.telegram?.messageId || 'None',
    isSpecificUpdate: isSpecificUpdate,
    isExplicitUpdate: isExplicitUpdate
  });

  // Always try to send the notification, even if the bot wasn't initialized
  if (!bot) {
    console.log('Attempting to initialize Telegram bot for sending update notification');
    try {
      bot = new TelegramBot(token, { polling: false });
      console.log('Telegram bot initialized successfully for sending update notification');
    } catch (error) {
      console.error('Failed to initialize Telegram bot for sending update notification:', error.message);
      return { success: false, messageId: null, error: 'Failed to initialize bot' };
    }
  }

  if (!chatId) {
    console.log('Telegram update notification skipped: Chat ID not set');
    return { success: false, messageId: null, error: 'Chat ID not set' };
  }

  try {
    // Make sure airdrop has all required fields with fallbacks
    const safeAirdrop = createSafeAirdrop(airdrop);

    // Format the message differently if it's a specific update
    let message;
    if (isSpecificUpdate) {
      message = `📣 *AIRDROP UPDATE* 📣\n\n`;
      message += `*${safeAirdrop.title}*\n\n`;
      message += `💬 *Update*: ${updateContent}\n\n`;
      message += `📅 *Update Date*: ${new Date().toLocaleDateString()}\n\n`;
      message += `🌐 *View on Airdrops-Geo*: [Click here](https://airdrops-geo.onrender.com/airdrops/${safeAirdrop._id})`;
    } else {
      message = formatAirdropMessage(safeAirdrop, true); // true = this is an update
    }

    console.log('Formatted Telegram update message:', message.substring(0, 100) + '...');

    let sentMessage;

    // If we have the original message ID, reply to it
    if (safeAirdrop.telegram && safeAirdrop.telegram.messageId) {
      console.log(`Sending as reply to message ID: ${safeAirdrop.telegram.messageId}`);
      sentMessage = await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_to_message_id: safeAirdrop.telegram.messageId
      });
    } else {
      // Otherwise send as a new message
      console.log('No original message ID found, sending as new message');
      sentMessage = await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });
    }

    console.log(`Airdrop update for "${safeAirdrop.title}" successfully posted to Telegram with message ID: ${sentMessage.message_id}`);
    return {
      success: true,
      messageId: sentMessage.message_id,
      chatId: chatId
    };
  } catch (error) {
    console.error('Error sending airdrop update to Telegram:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.body);
    }
    return { success: false, messageId: null };
  }
};

module.exports = {
  sendAirdropToTelegram,
  sendAirdropUpdateToTelegram
};
