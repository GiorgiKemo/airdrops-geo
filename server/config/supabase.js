const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase URL or Service Key not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test the connection
const testConnection = async () => {
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

module.exports = { supabase, testConnection };
