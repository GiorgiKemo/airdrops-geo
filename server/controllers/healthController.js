/**
 * Health check controller
 * Provides endpoints for monitoring the health of the application
 */
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');
const config = require('../config');
const packageJson = require('../../package.json');

/**
 * @desc    Basic health check
 * @route   GET /api/health
 * @access  Public
 */
const basicHealthCheck = (req, res) => {
  try {
    const healthcheck = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
    };

    res.status(200).json(healthcheck);
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
};

/**
 * @desc    Detailed health check
 * @route   GET /api/health/detailed
 * @access  Private/Admin
 */
const detailedHealthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Get system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
        free: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB',
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 100) + '%',
      },
      uptime: Math.round(os.uptime() / 3600) + ' hours',
    };
    
    // Get process information
    const processInfo = {
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: Math.round(process.uptime() / 60) + ' minutes',
      nodeVersion: process.version,
    };
    
    // Get application information
    const appInfo = {
      name: packageJson.name,
      version: packageJson.version,
      environment: config.server.nodeEnv,
      port: config.server.port,
    };
    
    // Get database information
    const dbInfo = {
      status: dbStatus,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    };
    
    // Assemble the health check response
    const healthcheck = {
      status: dbStatus === 'Connected' ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      system: systemInfo,
      process: processInfo,
      application: appInfo,
      database: dbInfo,
      features: {
        redis: config.redis.enabled ? 'Enabled' : 'Disabled',
        telegram: config.telegram.enabled ? 'Enabled' : 'Disabled',
        email: config.email && config.email.enabled ? 'Enabled' : 'Disabled',
      },
    };
    
    res.status(200).json(healthcheck);
  } catch (error) {
    logger.error(`Detailed health check error: ${error.message}`);
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
};

module.exports = {
  basicHealthCheck,
  detailedHealthCheck,
};
