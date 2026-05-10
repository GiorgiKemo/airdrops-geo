const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const useSupabase = process.env.USE_SUPABASE === 'true';
const isConfigured = Boolean(supabaseUrl && supabaseKey);

if (useSupabase && !isConfigured) {
  logger.error('Supabase URL or Service Key not found in environment variables');
}

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Test the connection
const testConnection = async () => {
  if (!isConfigured || !supabase) {
    logger.error('Supabase is not configured');
    return false;
  }

  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      logger.error(`Supabase connection error: ${error.message}`);
      return false;
    }
    
    logger.info('Supabase connected successfully');
    return true;
  } catch (error) {
    logger.error(`Supabase connection error: ${error.message}`);
    return false;
  }
};

module.exports = { supabase, testConnection, isConfigured };
