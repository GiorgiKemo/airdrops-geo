const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

// Import configuration
const config = require('./config');
const logger = require('./utils/logger');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { csrfProtection, setCsrfToken } = require('./middleware/csrfMiddleware');

// Import routes
const airdropRoutes = require('./routes/airdropRoutes');
const userRoutes = require('./routes/userRoutes');
const trackingRoutes = require('./routes/trackingRoutes');

// Import models
const User = require('./models/userModel');
const Airdrop = require('./models/airdropModel');

// Initialize Express app
const app = express();

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (enable in production)
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Set up file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// Set up static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Set up API routes with rate limiting
app.use('/api', apiLimiter); // Apply rate limiting to all API routes

// Endpoint to get a new CSRF token - must be defined BEFORE CSRF middleware
app.get('/api/csrf-token', setCsrfToken, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// Set CSRF token for all routes
app.use(setCsrfToken);

// Apply CSRF protection to all routes
app.use(csrfProtection);

// API routes
app.use('/api/airdrops', airdropRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tracking', trackingRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Test login endpoint
app.post('/api/test-login', (req, res) => {
  console.log('Test login endpoint called with body:', req.body);
  res.json({ success: true, message: 'Test login successful', user: { email: req.body.email, role: 'user' } });
});

// Serve React app in production
if (config.server.isProduction) {
  // Check for client build directory
  const possibleBuildDirs = [
    path.join(__dirname, '..', 'client', 'dist'),
    path.join(__dirname, '..', 'client', 'build'),
    path.join(__dirname, 'client', 'dist'),
    path.join(__dirname, 'client', 'build'),
  ];

  let clientBuildDir = null;

  for (const dir of possibleBuildDirs) {
    if (fs.existsSync(dir)) {
      clientBuildDir = dir;
      break;
    }
  }

  if (clientBuildDir) {
    logger.info(`Using client build directory: ${clientBuildDir}`);
    app.use(express.static(clientBuildDir));

    // Serve index.html for all routes not handled by the API
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildDir, 'index.html'));
    });
  } else {
    logger.warn('Client build directory not found. API-only mode.');
  }
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create initial admin user
const createInitialAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      logger.info('Admin user already exists. Skipping creation.');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
    });

    logger.info(`Admin user created: ${adminUser.email}`);
  } catch (error) {
    logger.error(`Error creating admin user: ${error.message}`);
  }
};

// Fix MongoDB indexes
const fixMongoDBIndexes = async () => {
  try {
    logger.info('Running index fix on startup...');

    // Get the MongoDB connection
    const db = mongoose.connection.db;

    // Get the views collection
    const collection = db.collection('views');

    // List all indexes before changes
    logger.info('Current indexes on views collection:');
    const indexes = await collection.indexes();
    logger.info(JSON.stringify(indexes));

    // Try to drop the unique index on airdropId if it exists
    try {
      await collection.dropIndex('airdropId_1');
      logger.info('Successfully dropped the unique index on airdropId');
    } catch (indexError) {
      logger.info(`No index named airdropId_1 found or error dropping index: ${indexError.message}`);
    }

    // Create a new non-unique index
    await collection.createIndex({ airdropId: 1 }, { unique: false });
    logger.info('Created new non-unique index on airdropId');

    // List indexes after changes
    logger.info('Updated indexes on views collection:');
    const updatedIndexes = await collection.indexes();
    logger.info(JSON.stringify(updatedIndexes));

    logger.info('Index fix completed successfully');
  } catch (error) {
    logger.error(`Error fixing MongoDB indexes: ${error.message}`);
  }
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.db.uri, config.db.options);
    logger.info('Connected to MongoDB');

    // Create initial admin user
    await createInitialAdminUser();

    // Fix MongoDB indexes
    await fixMongoDBIndexes();

    // Initialize Telegram integration if enabled
    if (config.telegram.enabled) {
      const telegramService = require('./services/telegramService');
      logger.info('Telegram integration initialized');
    }

    // Start the server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
