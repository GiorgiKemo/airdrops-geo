/**
 * Cache service for storing and retrieving data from Redis
 * Falls back to in-memory cache if Redis is not available
 */
const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Redis client if enabled
let redis = null;
if (config.redis.enabled) {
  try {
    redis = new Redis(config.redis.url);
    redis.on('connect', () => {
      logger.info('Connected to Redis server');
    });
    redis.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`);
      redis = null; // Fallback to in-memory cache on error
    });
  } catch (error) {
    logger.error(`Failed to initialize Redis: ${error.message}`);
  }
}

// In-memory cache fallback
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

/**
 * Cache service with Redis and in-memory fallback
 */
const cacheService = {
  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached data or null if not found
   */
  async get(key) {
    try {
      // Try Redis first if available
      if (redis) {
        const data = await redis.get(key);
        if (data) {
          logger.debug(`Cache hit for key: ${key} (Redis)`);
          return JSON.parse(data);
        }
        return null;
      }
      
      // Fallback to in-memory cache
      if (memoryCache.has(key)) {
        // Check if the cache entry has expired
        const expiry = memoryCacheExpiry.get(key);
        if (expiry && expiry > Date.now()) {
          logger.debug(`Cache hit for key: ${key} (Memory)`);
          return memoryCache.get(key);
        } else {
          // Remove expired entry
          this.del(key);
        }
      }
      
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  },

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 15 minutes)
   * @returns {Promise<void>}
   */
  async set(key, data, ttl = config.redis.defaultTTL) {
    try {
      // Try Redis first if available
      if (redis) {
        await redis.set(key, JSON.stringify(data), 'EX', ttl);
        logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s (Redis)`);
        return;
      }
      
      // Fallback to in-memory cache
      memoryCache.set(key, data);
      memoryCacheExpiry.set(key, Date.now() + (ttl * 1000));
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s (Memory)`);
      
      // Schedule cleanup for in-memory cache
      setTimeout(() => {
        if (memoryCacheExpiry.get(key) <= Date.now()) {
          this.del(key);
        }
      }, ttl * 1000);
    } catch (error) {
      logger.error(`Cache set error for key ${key}: ${error.message}`);
    }
  },

  /**
   * Delete data from cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async del(key) {
    try {
      // Try Redis first if available
      if (redis) {
        await redis.del(key);
        logger.debug(`Cache deleted for key: ${key} (Redis)`);
        return;
      }
      
      // Fallback to in-memory cache
      memoryCache.delete(key);
      memoryCacheExpiry.delete(key);
      logger.debug(`Cache deleted for key: ${key} (Memory)`);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}: ${error.message}`);
    }
  },

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Key pattern to match (e.g., "airdrops:*")
   * @returns {Promise<void>}
   */
  async invalidate(pattern) {
    try {
      // Try Redis first if available
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
          logger.debug(`Cache invalidated for pattern: ${pattern}, keys: ${keys.length} (Redis)`);
        }
        return;
      }
      
      // Fallback to in-memory cache (simple pattern matching)
      const regex = new RegExp(pattern.replace('*', '.*'));
      const keysToDelete = [];
      
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        memoryCache.delete(key);
        memoryCacheExpiry.delete(key);
      });
      
      logger.debug(`Cache invalidated for pattern: ${pattern}, keys: ${keysToDelete.length} (Memory)`);
    } catch (error) {
      logger.error(`Cache invalidation error for pattern ${pattern}: ${error.message}`);
    }
  },

  /**
   * Get or set cache data (convenience method)
   * @param {string} key - Cache key
   * @param {Function} fetchData - Function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - Data from cache or from fetchData function
   */
  async getOrSet(key, fetchData, ttl = config.redis.defaultTTL) {
    try {
      // Try to get from cache first
      const cachedData = await this.get(key);
      if (cachedData !== null) {
        return cachedData;
      }
      
      // If not in cache, fetch the data
      const data = await fetchData();
      
      // Cache the data for future requests
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      logger.error(`Cache getOrSet error for key ${key}: ${error.message}`);
      // If cache operations fail, just return the data directly
      return fetchData();
    }
  }
};

module.exports = cacheService;
