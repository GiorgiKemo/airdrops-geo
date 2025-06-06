const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

class View {
  /**
   * Create a new view record
   * @param {Object} viewData - View data
   * @returns {Promise<Object|null>} - Created view or null
   */
  static async create(viewData) {
    try {
      const { data, error } = await supabase
        .from('views')
        .insert({
          airdrop_id: viewData.airdropId,
          ip_address: viewData.ipAddress || ''
        })
        .select()
        .single();
        
      if (error) {
        logger.error(`Error creating view: ${error.message}`);
        return null;
      }
      
      // Also increment the views count in the airdrops table
      await supabase.rpc('increment_airdrop_views', { airdrop_id: viewData.airdropId });
      
      return {
        _id: data.id,
        airdropId: data.airdrop_id,
        timestamp: data.created_at,
        ipAddress: data.ip_address
      };
    } catch (error) {
      logger.error(`Error in create: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Count views by airdrop ID
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} - Count of views
   */
  static async countDocuments(filter) {
    try {
      if (filter.airdropId) {
        const { count, error } = await supabase
          .from('views')
          .select('*', { count: 'exact', head: true })
          .eq('airdrop_id', filter.airdropId);
          
        if (error) {
          logger.error(`Error counting views: ${error.message}`);
          return 0;
        }
        
        return count;
      }
      
      return 0;
    } catch (error) {
      logger.error(`Error in countDocuments: ${error.message}`);
      return 0;
    }
  }
  
  /**
   * Get view statistics
   * @param {string} airdropId - Airdrop ID
   * @param {Object} options - Options for statistics
   * @returns {Promise<Object>} - Statistics object
   */
  static async getStatistics(airdropId, options = {}) {
    try {
      // Get total views
      const { count: totalViews, error: countError } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('airdrop_id', airdropId);
        
      if (countError) {
        logger.error(`Error getting total views: ${countError.message}`);
        return { totalViews: 0, dailyViews: [] };
      }
      
      // Get daily views for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: dailyViewsData, error: dailyError } = await supabase
        .from('views')
        .select('created_at')
        .eq('airdrop_id', airdropId)
        .gte('created_at', thirtyDaysAgo.toISOString());
        
      if (dailyError) {
        logger.error(`Error getting daily views: ${dailyError.message}`);
        return { totalViews, dailyViews: [] };
      }
      
      // Process daily views
      const dailyViews = this.processDailyViews(dailyViewsData);
      
      return { totalViews, dailyViews };
    } catch (error) {
      logger.error(`Error in getStatistics: ${error.message}`);
      return { totalViews: 0, dailyViews: [] };
    }
  }
  
  /**
   * Process daily views data
   * @param {Array} viewsData - Views data
   * @returns {Array} - Processed daily views
   */
  static processDailyViews(viewsData) {
    const dailyCounts = {};
    
    // Group views by day
    viewsData.forEach(view => {
      const date = new Date(view.created_at);
      const day = date.toISOString().split('T')[0];
      
      if (!dailyCounts[day]) {
        dailyCounts[day] = 0;
      }
      
      dailyCounts[day]++;
    });
    
    // Convert to array format
    const result = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    }));
    
    // Sort by date
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return result;
  }
}

module.exports = View;
