const { supabase } = require('../../config/supabase');
const logger = require('../../utils/logger');

class Airdrop {
  /**
   * Find an airdrop by ID
   * @param {string} id - Airdrop ID
   * @returns {Promise<Object|null>} - Airdrop object or null
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('airdrops')
        .select(`
          *,
          social_links (*),
          telegram_info (*),
          airdrop_updates (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        logger.error(`Error finding airdrop by ID: ${error.message}`);
        return null;
      }
      
      // Transform data to match MongoDB structure
      return this.transformToMongoFormat(data);
    } catch (error) {
      logger.error(`Error in findById: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Find an airdrop by airdrop_id
   * @param {number} airdropId - Airdrop ID number
   * @returns {Promise<Object|null>} - Airdrop object or null
   */
  static async findByAirdropId(airdropId) {
    try {
      const { data, error } = await supabase
        .from('airdrops')
        .select(`
          *,
          social_links (*),
          telegram_info (*),
          airdrop_updates (*)
        `)
        .eq('airdrop_id', airdropId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned (not found)
          return null;
        }
        logger.error(`Error finding airdrop by airdrop_id: ${error.message}`);
        return null;
      }
      
      // Transform data to match MongoDB structure
      return this.transformToMongoFormat(data);
    } catch (error) {
      logger.error(`Error in findByAirdropId: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Find airdrops with filters
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of airdrops
   */
  static async find(filter = {}, options = {}) {
    try {
      let query = supabase
        .from('airdrops')
        .select(`
          *,
          social_links (*),
          telegram_info (*),
          airdrop_updates (*)
        `);
      
      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      // Apply sorting
      if (options.sort) {
        const sortField = Object.keys(options.sort)[0];
        const sortOrder = options.sort[sortField] === 1 ? 'asc' : 'desc';
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
      } else {
        // Default sort by created_at desc
        query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.skip) {
        query = query.range(options.skip, options.skip + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
        
      if (error) {
        logger.error(`Error finding airdrops: ${error.message}`);
        return [];
      }
      
      // Transform data to match MongoDB structure
      return data.map(airdrop => this.transformToMongoFormat(airdrop));
    } catch (error) {
      logger.error(`Error in find: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Create a new airdrop
   * @param {Object} airdropData - Airdrop data
   * @returns {Promise<Object|null>} - Created airdrop or null
   */
  static async create(airdropData) {
    try {
      // Start a transaction
      const { data: airdrop, error: airdropError } = await supabase
        .from('airdrops')
        .insert({
          title: airdropData.title,
          description: airdropData.description,
          token: airdropData.token,
          criteria: airdropData.criteria,
          start_date: airdropData.startDate,
          deadline: airdropData.deadline,
          status: airdropData.status || 'upcoming',
          cost_type: airdropData.costType || 'free',
          link: airdropData.link,
          claim_url: airdropData.claimUrl || '',
          logo_url: airdropData.logoUrl || '',
          card_color: airdropData.cardColor || '',
          predefined_color: airdropData.predefinedColor || 'default',
          skip_telegram_notification: airdropData.skipTelegramNotification || false
        })
        .select()
        .single();
        
      if (airdropError) {
        logger.error(`Error creating airdrop: ${airdropError.message}`);
        return null;
      }
      
      // Insert social links
      if (airdropData.socialLinks) {
        const { error: socialLinksError } = await supabase
          .from('social_links')
          .insert({
            airdrop_id: airdrop.id,
            website: airdropData.socialLinks.website || '',
            discord: airdropData.socialLinks.discord || '',
            twitter: airdropData.socialLinks.twitter || '',
            telegram: airdropData.socialLinks.telegram || '',
            github: airdropData.socialLinks.github || '',
            instagram: airdropData.socialLinks.instagram || ''
          });
          
        if (socialLinksError) {
          logger.error(`Error creating social links: ${socialLinksError.message}`);
        }
      }
      
      // Insert telegram info
      if (airdropData.telegram) {
        const { error: telegramError } = await supabase
          .from('telegram_info')
          .insert({
            airdrop_id: airdrop.id,
            message_id: airdropData.telegram.messageId,
            chat_id: airdropData.telegram.chatId,
            last_updated: airdropData.telegram.lastUpdated
          });
          
        if (telegramError) {
          logger.error(`Error creating telegram info: ${telegramError.message}`);
        }
      }
      
      // Get the complete airdrop with relations
      const { data: completeAirdrop, error: fetchError } = await supabase
        .from('airdrops')
        .select(`
          *,
          social_links (*),
          telegram_info (*),
          airdrop_updates (*)
        `)
        .eq('id', airdrop.id)
        .single();
        
      if (fetchError) {
        logger.error(`Error fetching complete airdrop: ${fetchError.message}`);
        return airdrop;
      }
      
      // Transform data to match MongoDB structure
      return this.transformToMongoFormat(completeAirdrop);
    } catch (error) {
      logger.error(`Error in create: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Update an airdrop
   * @param {string} id - Airdrop ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated airdrop or null
   */
  static async findByIdAndUpdate(id, updateData) {
    try {
      // Prepare airdrop update data
      const airdropUpdateData = {};
      
      // Map fields that go directly to airdrops table
      const directFields = [
        'title', 'description', 'token', 'criteria', 'startDate', 'deadline',
        'status', 'costType', 'link', 'claimUrl', 'logoUrl', 'cardColor',
        'predefinedColor', 'skipTelegramNotification'
      ];
      
      directFields.forEach(field => {
        if (updateData[field] !== undefined) {
          // Convert camelCase to snake_case
          const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          airdropUpdateData[snakeField] = updateData[field];
        }
      });
      
      // Update airdrop
      if (Object.keys(airdropUpdateData).length > 0) {
        const { error: airdropError } = await supabase
          .from('airdrops')
          .update(airdropUpdateData)
          .eq('id', id);
          
        if (airdropError) {
          logger.error(`Error updating airdrop: ${airdropError.message}`);
          return null;
        }
      }
      
      // Update social links if provided
      if (updateData.socialLinks) {
        const { error: socialLinksError } = await supabase
          .from('social_links')
          .update({
            website: updateData.socialLinks.website,
            discord: updateData.socialLinks.discord,
            twitter: updateData.socialLinks.twitter,
            telegram: updateData.socialLinks.telegram,
            github: updateData.socialLinks.github,
            instagram: updateData.socialLinks.instagram
          })
          .eq('airdrop_id', id);
          
        if (socialLinksError) {
          logger.error(`Error updating social links: ${socialLinksError.message}`);
        }
      }
      
      // Update telegram info if provided
      if (updateData.telegram) {
        const { error: telegramError } = await supabase
          .from('telegram_info')
          .update({
            message_id: updateData.telegram.messageId,
            chat_id: updateData.telegram.chatId,
            last_updated: updateData.telegram.lastUpdated
          })
          .eq('airdrop_id', id);
          
        if (telegramError) {
          logger.error(`Error updating telegram info: ${telegramError.message}`);
        }
      }
      
      // Add update if provided
      if (updateData.update) {
        const { error: updateError } = await supabase
          .from('airdrop_updates')
          .insert({
            airdrop_id: id,
            content: updateData.update.content,
            telegram_message_id: updateData.update.telegramMessageId
          });
          
        if (updateError) {
          logger.error(`Error adding airdrop update: ${updateError.message}`);
        }
      }
      
      // Get the updated airdrop
      const { data: updatedAirdrop, error: fetchError } = await supabase
        .from('airdrops')
        .select(`
          *,
          social_links (*),
          telegram_info (*),
          airdrop_updates (*)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) {
        logger.error(`Error fetching updated airdrop: ${fetchError.message}`);
        return null;
      }
      
      // Transform data to match MongoDB structure
      return this.transformToMongoFormat(updatedAirdrop);
    } catch (error) {
      logger.error(`Error in findByIdAndUpdate: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Delete an airdrop
   * @param {string} id - Airdrop ID
   * @returns {Promise<boolean>} - Success status
   */
  static async findByIdAndDelete(id) {
    try {
      // Deleting the airdrop will cascade delete related records due to foreign key constraints
      const { error } = await supabase
        .from('airdrops')
        .delete()
        .eq('id', id);
        
      if (error) {
        logger.error(`Error deleting airdrop: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error in findByIdAndDelete: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Increment airdrop views
   * @param {string} id - Airdrop ID
   * @returns {Promise<boolean>} - Success status
   */
  static async incrementViews(id) {
    try {
      const { error } = await supabase.rpc('increment_airdrop_views', { airdrop_id: id });
      
      if (error) {
        logger.error(`Error incrementing views: ${error.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error in incrementViews: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Transform Supabase data to MongoDB format
   * @param {Object} data - Supabase data
   * @returns {Object} - MongoDB format data
   */
  static transformToMongoFormat(data) {
    if (!data) return null;
    
    const result = {
      _id: data.id,
      airdropId: data.airdrop_id,
      title: data.title,
      description: data.description,
      token: data.token,
      criteria: data.criteria,
      startDate: data.start_date,
      deadline: data.deadline,
      status: data.status,
      costType: data.cost_type,
      link: data.link,
      claimUrl: data.claim_url,
      logoUrl: data.logo_url,
      cardColor: data.card_color,
      predefinedColor: data.predefined_color,
      views: data.views,
      skipTelegramNotification: data.skip_telegram_notification,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    // Add social links if available
    if (data.social_links && data.social_links.length > 0) {
      const socialLinks = data.social_links[0];
      result.socialLinks = {
        website: socialLinks.website,
        discord: socialLinks.discord,
        twitter: socialLinks.twitter,
        telegram: socialLinks.telegram,
        github: socialLinks.github,
        instagram: socialLinks.instagram
      };
    } else {
      result.socialLinks = {
        website: '',
        discord: '',
        twitter: '',
        telegram: '',
        github: '',
        instagram: ''
      };
    }
    
    // Add telegram info if available
    if (data.telegram_info && data.telegram_info.length > 0) {
      const telegramInfo = data.telegram_info[0];
      result.telegram = {
        messageId: telegramInfo.message_id,
        chatId: telegramInfo.chat_id,
        lastUpdated: telegramInfo.last_updated
      };
    } else {
      result.telegram = {
        messageId: null,
        chatId: null,
        lastUpdated: null
      };
    }
    
    // Add updates if available
    if (data.airdrop_updates && data.airdrop_updates.length > 0) {
      result.updates = data.airdrop_updates.map(update => ({
        content: update.content,
        date: update.created_at,
        telegramMessageId: update.telegram_message_id
      }));
    } else {
      result.updates = [];
    }
    
    return result;
  }
}

module.exports = Airdrop;
