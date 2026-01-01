const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
// Try multiple possible locations for the .env file
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../server/.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment variables from ${envPath}`);
    break;
  }
}

const useSupabase = process.env.USE_SUPABASE === 'true';

// Define required environment variables based on DB mode
const requiredEnvVars = ['JWT_SECRET'];
if (useSupabase) {
  requiredEnvVars.push('SUPABASE_URL', 'SUPABASE_SERVICE_KEY');
} else {
  requiredEnvVars.push('MONGODB_URI');
}

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configuration object
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },

  // Database configuration
  db: {
    uri: process.env.MONGODB_URI || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  supabase: {
    enabled: useSupabase,
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    environment: process.env.NODE_ENV || 'development',
  },

  // Email configuration
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@airdrops-geo.com',
    enabled: Boolean(process.env.SENDGRID_API_KEY),
  },

  // Debug environment variables
  debug: {
    sendgridApiKeyExists: Boolean(process.env.SENDGRID_API_KEY),
    sendgridApiKeyLength: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0,
    envVars: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')),
  },

  // Client configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  // Telegram configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  },

  // Redis configuration for caching
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: Boolean(process.env.REDIS_URL) || process.env.NODE_ENV === 'production',
    defaultTTL: 60 * 15, // 15 minutes in seconds
  },
};

module.exports = config;
