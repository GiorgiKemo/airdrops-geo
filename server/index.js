const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Run the index fix on startup
    try {
      console.log('Running index fix on startup...');

      // Get the MongoDB connection
      const db = mongoose.connection.db;

      // Get the views collection
      const collection = db.collection('views');

      // List all indexes before changes
      console.log('Current indexes on views collection:');
      const indexes = await collection.indexes();
      console.log(indexes);

      // Try to drop the unique index on airdropId if it exists
      try {
        await collection.dropIndex('airdropId_1');
        console.log('Successfully dropped the unique index on airdropId');
      } catch (indexError) {
        console.log('No index named airdropId_1 found or error dropping index:', indexError.message);
      }

      // Create a new non-unique index
      await collection.createIndex({ airdropId: 1 }, { unique: false });
      console.log('Created new non-unique index on airdropId');

      // List indexes after changes
      console.log('Updated indexes on views collection:');
      const updatedIndexes = await collection.indexes();
      console.log(updatedIndexes);

      console.log('Index fix completed successfully');
    } catch (fixError) {
      console.error('Error fixing MongoDB index:', fixError);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Import models
const Airdrop = require('./models/airdropModel');
const Tracking = require('./models/trackingModel');
const View = require('./models/viewModel');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage });

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log CORS configuration
console.log('CORS configuration:', {
  origin: process.env.CORS_ORIGIN || '*',
  environment: process.env.NODE_ENV
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referer = req.headers['referer'] || 'none';

  console.log(`[${timestamp}] REQUEST: ${method} ${url} - IP: ${ip} - Referer: ${referer} - User-Agent: ${userAgent}`);

  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${timestamp}] RESPONSE: ${method} ${url} - Status: ${res.statusCode}`);
    return originalSend.call(this, body);
  };

  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes

// Get all airdrops
app.get('/api/airdrops', async (req, res) => {
  try {
    const airdrops = await Airdrop.find({});
    res.json(airdrops);
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single airdrop by ID
app.get('/api/airdrops/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Fetching airdrop with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;

    // Check if the ID is a valid MongoDB ObjectID
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`ID ${id} is a valid MongoDB ObjectID, searching by _id`);
      airdrop = await Airdrop.findById(id);
      if (airdrop) {
        console.log(`Found airdrop by _id: ${airdrop.title}`);
      } else {
        console.log(`No airdrop found with _id: ${id}`);
      }
    } else {
      console.log(`ID ${id} is not a valid MongoDB ObjectID`);
    }

    // If not found, try to find by airdropId
    if (!airdrop) {
      console.log(`Searching by airdropId: ${id}`);
      airdrop = await Airdrop.findOne({ airdropId: id });
      if (airdrop) {
        console.log(`Found airdrop by airdropId: ${airdrop.title}`);
      } else {
        console.log(`No airdrop found with airdropId: ${id}`);
      }
    }

    if (!airdrop) {
      console.log(`Airdrop not found with ID: ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    console.log(`Found airdrop: ${airdrop.title} (ID: ${airdrop._id})`);

    // Increment view count
    airdrop.views = (airdrop.views || 0) + 1;
    await airdrop.save();

    // Track the view
    try {
      const view = new View({
        airdropId: airdrop._id,
        timestamp: new Date(),
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown'
      });
      await view.save();
    } catch (viewError) {
      console.error('Error tracking view:', viewError);
      // Don't fail the request if view tracking fails
    }

    res.json(airdrop);
  } catch (error) {
    console.error(`Error fetching airdrop with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new airdrop
app.post('/api/airdrops', upload.single('logo'), async (req, res) => {
  try {
    const airdropData = req.body;

    // Handle logo upload if provided
    if (req.file) {
      const logoFilename = `${Date.now()}-${req.file.originalname}`;
      const logoPath = path.join('uploads', logoFilename);
      airdropData.logoPath = logoPath;
      airdropData.logoUrl = `/uploads/${logoFilename}`;

      // Move the uploaded file to the uploads directory
      fs.renameSync(req.file.path, path.join(__dirname, logoPath));
    }

    // Generate a unique airdropId
    const latestAirdrop = await Airdrop.findOne().sort({ airdropId: -1 });
    airdropData.airdropId = latestAirdrop ? latestAirdrop.airdropId + 1 : 1;

    // Create the airdrop
    const airdrop = new Airdrop(airdropData);
    const savedAirdrop = await airdrop.save();

    // Explicitly send the new airdrop to Telegram
    try {
      console.log('Explicitly sending new airdrop to Telegram');
      const telegramService = require('./services/telegramService');
      const result = await telegramService.sendAirdropToTelegram(savedAirdrop);

      // If successful, store the Telegram message ID
      if (result.success && result.messageId) {
        await Airdrop.findByIdAndUpdate(savedAirdrop._id, {
          'telegram.messageId': result.messageId,
          'telegram.chatId': result.chatId,
          'telegram.lastUpdated': new Date()
        });

        console.log(`Stored Telegram message ID ${result.messageId} for new airdrop ${savedAirdrop.airdropId}`);
      } else {
        console.log('Failed to send new airdrop to Telegram');
      }
    } catch (telegramError) {
      console.error('Error sending new airdrop to Telegram:', telegramError);
      // Don't fail the request if Telegram notification fails
    }

    res.status(201).json(savedAirdrop);
  } catch (error) {
    console.error('Error creating airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an existing airdrop
app.put('/api/airdrops/:id', upload.single('logo'), async (req, res) => {
  try {
    const airdropData = req.body;
    const id = req.params.id;

    // Try to find by MongoDB ObjectID first
    let existingAirdrop = null;

    // Check if the ID is a valid MongoDB ObjectID
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Updating airdrop: ID ${id} is a valid MongoDB ObjectID, searching by _id`);
      existingAirdrop = await Airdrop.findById(id);
    }

    // If not found, try to find by airdropId (as a number)
    if (!existingAirdrop) {
      console.log(`Updating airdrop: No airdrop found with _id ${id}, trying airdropId`);
      // Try to convert to number if possible
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        existingAirdrop = await Airdrop.findOne({ airdropId: numericId });
      }
    }

    if (!existingAirdrop) {
      console.log(`Updating airdrop: No airdrop found with ID ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    console.log(`Updating airdrop: Found airdrop with title ${existingAirdrop.title}`);


    // Handle logo upload if provided
    if (req.file) {
      // Get the old logo path to delete it later
      const oldLogoPath = existingAirdrop.logoPath;

      // Set the new logo path and URL
      const logoFilename = `${Date.now()}-${req.file.originalname}`;
      const logoPath = path.join('uploads', logoFilename);
      airdropData.logoPath = logoPath;
      airdropData.logoUrl = `/uploads/${logoFilename}`;

      // Move the uploaded file to the uploads directory
      fs.renameSync(req.file.path, path.join(__dirname, logoPath));

      // Delete the old logo file if it exists
      if (oldLogoPath) {
        const oldLogoFullPath = path.join(__dirname, oldLogoPath);
        if (fs.existsSync(oldLogoFullPath)) {
          fs.unlinkSync(oldLogoFullPath);
        }
      }
    }

    // Check if this is a bell update (which should trigger a notification)
    const isBellUpdate = req.query.notifyTelegram === 'true';

    console.log(`Update type: ${isBellUpdate ? 'Bell Update' : 'Regular Edit'}`);
    console.log(`Status: ${existingAirdrop.status} -> ${airdropData.status || existingAirdrop.status}`);
    console.log(`Notify Telegram: ${req.query.notifyTelegram}`);

    // Only send Telegram notification for bell updates
    if (!isBellUpdate) {
      console.log('Skipping Telegram notification for regular edit or status change');
      airdropData.skipTelegramNotification = true;
    } else {
      console.log('Will send Telegram notification for bell update');
      // Make sure we don't have the skip flag
      delete airdropData.skipTelegramNotification;

      // For bell updates, we'll also explicitly send the notification after saving
      airdropData.sendTelegramNotification = true;
    }

    // Update the airdrop using the _id field
    const updatedAirdrop = await Airdrop.findByIdAndUpdate(
      existingAirdrop._id,
      { $set: airdropData },
      { new: true }
    );

    // For bell updates, explicitly send the notification
    if (airdropData.sendTelegramNotification) {
      try {
        console.log('Explicitly sending bell update to Telegram');
        const telegramService = require('./services/telegramService');
        const result = await telegramService.sendAirdropUpdateToTelegram(updatedAirdrop, {
          isExplicitUpdate: true
        });

        if (result.success && result.messageId) {
          console.log(`Successfully sent bell update to Telegram with message ID ${result.messageId}`);
        } else {
          console.log('Failed to send bell update to Telegram');
        }
      } catch (telegramError) {
        console.error('Error sending bell update to Telegram:', telegramError);
      }
    }

    // Remove the flags after a short delay
    setTimeout(async () => {
      try {
        await Airdrop.updateOne(
          { _id: updatedAirdrop._id },
          { $unset: { skipTelegramNotification: 1, sendTelegramNotification: 1 } }
        );
        console.log(`Removed notification flags from airdrop ${updatedAirdrop.airdropId}`);
      } catch (err) {
        console.error('Error removing notification flags:', err);
      }
    }, 2000);

    res.json(updatedAirdrop);
  } catch (error) {
    console.error('Error updating airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete airdrop
app.delete('/api/airdrops/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Deleting airdrop with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;

    // Check if the ID is a valid MongoDB ObjectID
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Deleting airdrop: ID ${id} is a valid MongoDB ObjectID, searching by _id`);
      airdrop = await Airdrop.findById(id);
    }

    // If not found, try to find by airdropId (as a number)
    if (!airdrop) {
      console.log(`Deleting airdrop: No airdrop found with _id ${id}, trying airdropId`);
      // Try to convert to number if possible
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        airdrop = await Airdrop.findOne({ airdropId: numericId });
      }
    }

    if (!airdrop) {
      console.log(`Deleting airdrop: No airdrop found with ID ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    console.log(`Deleting airdrop: Found airdrop with title ${airdrop.title}`);


    // Delete the logo file if it exists
    if (airdrop.logoPath) {
      const logoFullPath = path.join(__dirname, airdrop.logoPath);
      if (fs.existsSync(logoFullPath)) {
        fs.unlinkSync(logoFullPath);
      }
    }

    // Delete the airdrop using its _id
    await Airdrop.findByIdAndDelete(airdrop._id);

    console.log(`Airdrop deleted successfully: ${airdrop.title} (ID: ${airdrop._id})`);
    res.json({ message: 'Airdrop deleted successfully' });
  } catch (error) {
    console.error('Error deleting airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an update to an airdrop
app.post('/api/airdrops/:id/updates', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Update content is required' });
    }

    const airdrop = await Airdrop.findOne({ airdropId: req.params.id });

    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    // Create a new update
    const update = {
      content,
      date: new Date()
    };

    // Add the update to the airdrop
    airdrop.updates.push(update);

    // Save the airdrop
    const updatedAirdrop = await airdrop.save();

    // Explicitly send the update to Telegram
    try {
      const telegramService = require('./services/telegramService');
      const result = await telegramService.sendAirdropUpdateToTelegram(updatedAirdrop, {
        updateContent: content,
        isExplicitUpdate: true  // Flag to indicate this is from the update button
      });

      // If successful, store the Telegram message ID with the update
      if (result.success && result.messageId) {
        // Get the index of the update we just added
        const updateIndex = updatedAirdrop.updates.length - 1;

        // Update the Telegram message ID for this update
        updatedAirdrop.updates[updateIndex].telegramMessageId = result.messageId;
        await updatedAirdrop.save();

        console.log(`Stored Telegram message ID ${result.messageId} for update`);
      }
    } catch (telegramError) {
      console.error('Failed to send update to Telegram:', telegramError);
      // Don't fail the request if Telegram posting fails
    }

    res.status(201).json(updatedAirdrop);
  } catch (error) {
    console.error('Error adding update to airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset view data
app.post('/api/reset-views', async (req, res) => {
  try {
    await View.deleteMany({});
    await Airdrop.updateMany({}, { $set: { views: 0 } });
    res.json({ message: 'View data reset successfully' });
  } catch (error) {
    console.error('Error resetting view data:', error);
    res.status(500).json({ message: 'Failed to reset view data' });
  }
});

// Add a diagnostic endpoint
app.get('/api/diagnose', (req, res) => {
  try {
    // Run the diagnostics script
    const diagnostics = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        currentDirectory: process.cwd(),
        dirname: __dirname
      },
      clientBuildDirectories: {}
    };

    // Check for client build directories
    const possiblePaths = [
      path.resolve(__dirname, '../client/dist'),
      path.resolve(__dirname, '../client/build'),
      '/opt/render/project/src/client/dist',
      '/opt/render/project/src/client/build'
    ];

    possiblePaths.forEach(p => {
      const exists = fs.existsSync(p);
      diagnostics.clientBuildDirectories[p] = {
        exists,
        contents: []
      };

      if (exists) {
        // Check for index.html
        const indexPath = path.join(p, 'index.html');
        diagnostics.clientBuildDirectories[p].indexHtml = fs.existsSync(indexPath);

        // List directory contents
        try {
          const files = fs.readdirSync(p);
          diagnostics.clientBuildDirectories[p].contents = files.map(file => {
            const stats = fs.statSync(path.join(p, file));
            return {
              name: file,
              type: stats.isDirectory() ? 'directory' : 'file'
            };
          });
        } catch (err) {
          diagnostics.clientBuildDirectories[p].error = err.message;
        }
      }
    });

    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Add a diagnostic endpoint to check if an airdrop exists
app.get('/api/check-airdrop/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Checking if airdrop exists with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;
    let foundBy = '';

    // Check if the ID is a valid MongoDB ObjectID
    if (mongoose.Types.ObjectId.isValid(id)) {
      airdrop = await Airdrop.findById(id);
      if (airdrop) foundBy = 'MongoDB ObjectID';
    }

    // If not found, try to find by airdropId
    if (!airdrop) {
      airdrop = await Airdrop.findOne({ airdropId: id });
      if (airdrop) foundBy = 'airdropId';
    }

    if (airdrop) {
      console.log(`Airdrop found by ${foundBy}:`, airdrop);
      return res.json({
        exists: true,
        foundBy,
        airdrop: {
          _id: airdrop._id,
          airdropId: airdrop.airdropId,
          title: airdrop.title,
          token: airdrop.token,
          status: airdrop.status
        }
      });
    } else {
      console.log(`Airdrop with ID ${id} not found`);
      return res.json({
        exists: false,
        message: `Airdrop with ID ${id} not found`
      });
    }
  } catch (error) {
    console.error(`Error checking airdrop with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add an endpoint to fix the MongoDB index issue
app.get('/api/fix-index', async (req, res) => {
  try {
    console.log('Running index fix from API endpoint...');

    // Get the MongoDB connection
    const db = mongoose.connection.db;

    // Get the views collection
    const collection = db.collection('views');

    // List all indexes before changes
    console.log('Current indexes on views collection:');
    const indexes = await collection.indexes();
    console.log(indexes);

    // Try to drop the unique index on airdropId if it exists
    try {
      await collection.dropIndex('airdropId_1');
      console.log('Successfully dropped the unique index on airdropId');
    } catch (indexError) {
      console.log('No index named airdropId_1 found or error dropping index:', indexError.message);
    }

    // Create a new non-unique index
    await collection.createIndex({ airdropId: 1 }, { unique: false });
    console.log('Created new non-unique index on airdropId');

    // List indexes after changes
    console.log('Updated indexes on views collection:');
    const updatedIndexes = await collection.indexes();
    console.log(updatedIndexes);

    res.json({
      message: 'Index fix completed successfully',
      beforeIndexes: indexes,
      afterIndexes: updatedIndexes
    });
  } catch (error) {
    console.error('Error fixing index:', error);
    res.status(500).json({ message: 'Error fixing index', error: error.message });
  }
});

// User tracking routes
// Get tracked airdrops for a user
app.get('/api/tracking/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's tracking document
    const tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      // If no tracking found, return empty array
      return res.json([]);
    }

    // Get the airdrops that the user is tracking
    const trackedAirdrops = await Airdrop.find({
      _id: { $in: tracking.airdropIds }
    });

    res.json(trackedAirdrops);
  } catch (error) {
    console.error('Error fetching tracked airdrops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an airdrop to user's tracking
app.post('/api/tracking', async (req, res) => {
  try {
    const { userId, airdropId } = req.body;

    if (!userId || !airdropId) {
      return res.status(400).json({ message: 'User ID and Airdrop ID are required' });
    }

    // Check if the airdrop exists
    const airdrop = await Airdrop.findById(airdropId);
    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    // Find or create the user's tracking document
    let tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      // Create new tracking document for this user
      tracking = new Tracking({
        userId,
        airdropIds: [airdropId]
      });
    } else {
      // Add the airdrop to the user's tracking if not already there
      if (!tracking.airdropIds.includes(airdropId)) {
        tracking.airdropIds.push(airdropId);
      }
    }

    await tracking.save();

    res.json({
      message: 'Airdrop tracked successfully',
      tracking: tracking.airdropIds
    });
  } catch (error) {
    console.error('Error tracking airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove an airdrop from user's tracking
app.delete('/api/tracking', async (req, res) => {
  try {
    const { userId, airdropId } = req.body;

    if (!userId || !airdropId) {
      return res.status(400).json({ message: 'User ID and Airdrop ID are required' });
    }

    // Find the user's tracking document
    const tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      return res.status(404).json({ message: 'User tracking not found' });
    }

    // Remove the airdrop from the user's tracking
    tracking.airdropIds = tracking.airdropIds.filter(id => id.toString() !== airdropId.toString());

    await tracking.save();

    res.json({
      message: 'Airdrop untracked successfully',
      tracking: tracking.airdropIds
    });
  } catch (error) {
    console.error('Error untracking airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 404 handler for API routes - must be placed AFTER all API routes
app.use('/api/*', (req, res) => {
  console.log(`API route not found: ${req.originalUrl}`);
  return res.status(404).json({ message: 'API endpoint not found' });
});

// Add specific routes for client-side routing
const clientRoutes = [
  '/admin',
  '/admin/*',
  '/airdrops',
  '/airdrops/*',
  '/login',
  '/register',
  '/dashboard',
  '/dashboard/*',
  '/terms',
  '/privacy',
  '/cookies',
  '/all'
];

// Handle specific client-side routes
clientRoutes.forEach(route => {
  app.get(route, (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Handling specific client route: ${req.path}`);

    // Serve the index.html file
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
});

// IMPORTANT: This catch-all route handler must be placed AFTER all other routes
// It will handle ALL client-side routes by serving the index.html file
app.get('*', (req, res) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const reqPath = req.path;
  const query = JSON.stringify(req.query);
  const headers = JSON.stringify(req.headers);

  console.log(`[${timestamp}] CATCH-ALL HANDLER: ${method} ${url}`);
  console.log(`[${timestamp}] Path: ${reqPath}, Query: ${query}`);
  console.log(`[${timestamp}] Headers: ${headers}`);

  // Skip API routes and static files
  if (reqPath.startsWith('/api/') || reqPath.startsWith('/uploads/')) {
    console.log(`[${timestamp}] Skipping catch-all handler for API or static file: ${reqPath}`);
    return res.status(404).send('Not Found');
  }

  console.log(`[${timestamp}] Processing client-side route: ${reqPath}`);

  // Try to serve the index.html file from the client build directory first
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  const clientIndexPath = path.join(clientBuildPath, 'index.html');

  console.log(`[${timestamp}] Checking for client index.html at: ${clientIndexPath}`);
  if (fs.existsSync(clientIndexPath)) {
    console.log(`[${timestamp}] Found client index.html, serving from: ${clientIndexPath}`);
    return res.sendFile(clientIndexPath, (err) => {
      if (err) {
        console.error(`[${timestamp}] Error serving client index.html:`, err);
        // Try fallback if there's an error
        tryFallback();
      } else {
        console.log(`[${timestamp}] Successfully served client index.html for: ${reqPath}`);
      }
    });
  } else {
    console.log(`[${timestamp}] Client index.html not found at: ${clientIndexPath}`);
    tryFallback();
  }

  // Fallback function to try server public directory
  function tryFallback() {
    // If client build directory doesn't exist, try the server public directory
    const serverPublicPath = path.join(__dirname, 'public');
    const serverIndexPath = path.join(serverPublicPath, 'index.html');

    console.log(`[${timestamp}] Checking for server index.html at: ${serverIndexPath}`);
    if (fs.existsSync(serverIndexPath)) {
      console.log(`[${timestamp}] Found server index.html, serving from: ${serverIndexPath}`);
      return res.sendFile(serverIndexPath, (err) => {
        if (err) {
          console.error(`[${timestamp}] Error serving server index.html:`, err);
          return res.status(500).send('Internal Server Error - Could not serve index.html');
        } else {
          console.log(`[${timestamp}] Successfully served server index.html for: ${reqPath}`);
        }
      });
    } else {
      console.log(`[${timestamp}] Server index.html not found at: ${serverIndexPath}`);
      console.log(`[${timestamp}] No index.html file found to serve for: ${reqPath}`);
      return res.status(404).send('Not Found - No index.html file available');
    }
  }
});

// Set up Telegram integration
if (process.env.NODE_ENV === 'production') {
  try {
    const setupTelegramIntegration = require('./telegram-integration');
    setupTelegramIntegration();
    console.log('Telegram integration set up successfully');
  } catch (error) {
    console.error('Error setting up Telegram integration:', error);
  }
}

// IMPORTANT: This must be the last middleware before starting the server
// Set up client-side routing for Render
const setupRenderServer = require('./render-setup');
setupRenderServer(app);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
