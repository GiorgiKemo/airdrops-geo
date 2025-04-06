const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import seed function
const seedDatabase = require('./scripts/seedDatabase');

// Connect to MongoDB and seed database
connectDB().then((conn) => {
  if (conn) {
    console.log('MongoDB connection successful, checking if database needs seeding...');
    // Check if we need to seed the database
    seedDatabase.checkAndSeedDatabase();
  } else {
    console.log('MongoDB connection failed, skipping database seeding.');
  }
}).catch(err => {
  console.error('Unexpected error during MongoDB connection:', err);
});

// Import models
const Airdrop = require('./models/airdropModel');
const Tracking = require('./models/trackingModel');
const View = require('./models/viewModel');

const app = express();

// Middleware
app.use(cors());

// Configure CORS for specific origins
app.use((req, res, next) => {
  const allowedOrigins = ['https://airdrops-geo.onrender.com', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Airdrop routes
app.get('/api/airdrops', async (_req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning empty array');
      return res.json([]);
    }

    const airdrops = await Airdrop.find({}).maxTimeMS(5000);
    console.log(`Found ${airdrops.length} airdrops`);
    res.json(airdrops);
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    // Return empty array instead of error to prevent frontend from crashing
    res.json([]);
  }
});

app.get('/api/airdrops/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Fetching airdrop with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If ID is a valid MongoDB ObjectID format
      console.log(`ID ${id} appears to be a MongoDB ObjectID, trying to find by _id`);
      try {
        airdrop = await Airdrop.findById(id);
        if (airdrop) {
          console.log(`Found airdrop by ObjectID: ${airdrop.title}`);
        }
      } catch (err) {
        console.log('Error finding by ObjectID:', err);
      }
    }

    // If not found by ObjectID, try by airdropId (numeric)
    if (!airdrop) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        console.log(`Trying to find airdrop by numeric airdropId: ${numericId}`);
        airdrop = await Airdrop.findOne({ airdropId: numericId });
        if (airdrop) {
          console.log(`Found airdrop by numeric ID: ${airdrop.title}`);
        }
      }
    }

    if (!airdrop) {
      console.log(`Airdrop not found with ID: ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Find or create view tracking for this airdrop
    const airdropId = airdrop.airdropId || id;
    let viewTracking = await View.findOne({ airdropId });

    if (!viewTracking) {
      viewTracking = new View({
        airdropId,
        ipAddresses: [],
      });
    }

    // Only increment views if this IP hasn't viewed this airdrop before
    if (!viewTracking.ipAddresses.includes(clientIp)) {
      // Increment views counter
      airdrop.views = (airdrop.views || 0) + 1;
      await airdrop.save();

      // Add IP to the tracking list
      viewTracking.ipAddresses.push(clientIp);
      await viewTracking.save();

      console.log(`New view from IP ${clientIp} for airdrop ${airdropId}`);
    } else {
      console.log(`Duplicate view from IP ${clientIp} for airdrop ${airdropId} - not counting`);
    }

    res.json(airdrop);
  } catch (error) {
    console.error('Error fetching airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/airdrops', async (req, res) => {
  try {
    const { title, description, token, criteria, deadline, startDate, status, costType, link, claimUrl, logoUrl, cardColor, predefinedColor, socialLinks } = req.body;

    console.log('Social Links received:', socialLinks);
    console.log('Social Links type:', typeof socialLinks);

    console.log('Received airdrop data:', req.body);
    console.log('Card color:', cardColor);
    console.log('Predefined color:', predefinedColor);

    // Validate required fields
    if (!title || !description || !token || !criteria || !deadline || !status || !link) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ensure socialLinks is properly structured
    const cleanedSocialLinks = {
      website: socialLinks?.website || '',
      discord: socialLinks?.discord || '',
      twitter: socialLinks?.twitter || '',
      telegram: socialLinks?.telegram || '',
      github: socialLinks?.github || '',
      instagram: socialLinks?.instagram || ''
    };

    console.log('Cleaned social links:', cleanedSocialLinks);

    // Get the next ID (find the highest airdropId and add 1)
    const highestAirdrop = await Airdrop.findOne().sort({ airdropId: -1 });
    const nextId = highestAirdrop ? highestAirdrop.airdropId + 1 : 1;

    const newAirdrop = new Airdrop({
      airdropId: nextId,
      title,
      description,
      token,
      criteria,
      deadline,
      startDate: startDate || new Date().toISOString().split('T')[0], // Default to today if not provided
      status,
      costType: costType || 'free', // Default to free if not provided
      link,
      claimUrl: claimUrl || '', // Optional claim URL
      logoUrl, // Optional logo URL
      cardColor, // Custom hex color code (optional)
      predefinedColor: predefinedColor || 'default', // Predefined color (optional)
      socialLinks: cleanedSocialLinks, // Social media links
      views: 0,
    });

    const savedAirdrop = await newAirdrop.save();
    res.status(201).json(savedAirdrop);
  } catch (error) {
    console.error('Error creating airdrop:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/airdrops/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Updating airdrop with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If ID is a valid MongoDB ObjectID format
      console.log(`ID ${id} appears to be a MongoDB ObjectID, trying to find by _id`);
      try {
        airdrop = await Airdrop.findById(id);
        if (airdrop) {
          console.log(`Found airdrop by ObjectID: ${airdrop.title}`);
        }
      } catch (err) {
        console.log('Error finding by ObjectID:', err);
      }
    }

    // If not found by ObjectID, try by airdropId (numeric)
    if (!airdrop) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        console.log(`Trying to find airdrop by numeric airdropId: ${numericId}`);
        airdrop = await Airdrop.findOne({ airdropId: numericId });
        if (airdrop) {
          console.log(`Found airdrop by numeric ID: ${airdrop.title}`);
        }
      }
    }

    if (!airdrop) {
      console.log(`Airdrop not found with ID: ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    const { title, description, token, criteria, deadline, startDate, status, costType, link, claimUrl, logoUrl, cardColor, predefinedColor, socialLinks } = req.body;

    console.log('Social Links in PUT:', socialLinks);
    console.log('Social Links type in PUT:', typeof socialLinks);

    // Check if this is a partial update request (logo only, status only, etc.)
    const isPartialUpdate = Object.keys(req.body).length === 1;
    const isLogoUpdateOnly = isPartialUpdate && logoUrl !== undefined;
    const isStatusUpdateOnly = isPartialUpdate && status !== undefined;

    console.log('Update type:', {
      isPartialUpdate,
      isLogoUpdateOnly,
      isStatusUpdateOnly,
      fieldsToUpdate: Object.keys(req.body)
    });

    // If it's a full update (not just logo or status), validate all required fields
    if (!isPartialUpdate && (!title || !description || !token || !criteria || !deadline || !status || !link)) {
      return res.status(400).json({ message: 'All fields are required for a full update' });
    }

    // Ensure socialLinks is properly structured
    const cleanedSocialLinks = socialLinks ? {
      website: socialLinks.website || '',
      discord: socialLinks.discord || '',
      twitter: socialLinks.twitter || '',
      telegram: socialLinks.telegram || '',
      github: socialLinks.github || '',
      instagram: socialLinks.instagram || ''
    } : airdrop.socialLinks;

    // Update airdrop fields
    if (isLogoUpdateOnly) {
      // Only update the logo URL
      airdrop.logoUrl = logoUrl;
      console.log('Updating logo URL only to:', logoUrl);
    } else if (isStatusUpdateOnly) {
      // Only update the status
      airdrop.status = status;
      console.log('Updating status only to:', status);
    } else {
      // Full update or multiple fields
      if (title) airdrop.title = title;
      if (description) airdrop.description = description;
      if (token) airdrop.token = token;
      if (criteria) airdrop.criteria = criteria;
      if (deadline) airdrop.deadline = deadline;
      if (startDate) airdrop.startDate = startDate;
      if (status) airdrop.status = status;
      if (costType) airdrop.costType = costType;
      if (link) airdrop.link = link;
      if (claimUrl !== undefined) airdrop.claimUrl = claimUrl;
      if (logoUrl) airdrop.logoUrl = logoUrl;
      if (cardColor !== undefined) airdrop.cardColor = cardColor;
      if (predefinedColor) airdrop.predefinedColor = predefinedColor;
      if (socialLinks) airdrop.socialLinks = cleanedSocialLinks;
      console.log('Performing multi-field update');
    }

    const updatedAirdrop = await airdrop.save();
    res.json(updatedAirdrop);
  } catch (error) {
    console.error('Error updating airdrop:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/airdrops/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Deleting airdrop with ID: ${id}`);

    // Try to find by MongoDB ObjectID first
    let airdrop = null;
    let deleteQuery = {};
    let viewDeleteQuery = {};

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If ID is a valid MongoDB ObjectID format
      console.log(`ID ${id} appears to be a MongoDB ObjectID, trying to find by _id`);
      try {
        airdrop = await Airdrop.findById(id);
        if (airdrop) {
          console.log(`Found airdrop by ObjectID: ${airdrop.title}`);
          deleteQuery = { _id: id };
          viewDeleteQuery = { airdropId: airdrop.airdropId };
        }
      } catch (err) {
        console.log('Error finding by ObjectID:', err);
      }
    }

    // If not found by ObjectID, try by airdropId (numeric)
    if (!airdrop) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        console.log(`Trying to find airdrop by numeric airdropId: ${numericId}`);
        airdrop = await Airdrop.findOne({ airdropId: numericId });
        if (airdrop) {
          console.log(`Found airdrop by numeric ID: ${airdrop.title}`);
          deleteQuery = { airdropId: numericId };
          viewDeleteQuery = { airdropId: numericId };
        }
      }
    }

    if (!airdrop) {
      console.log(`Airdrop not found with ID: ${id}`);
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    await Airdrop.deleteOne(deleteQuery);
    console.log(`Deleted airdrop with query:`, deleteQuery);

    // Also delete any view tracking for this airdrop
    await View.deleteOne(viewDeleteQuery);
    console.log(`Deleted view tracking with query:`, viewDeleteQuery);

    res.json({ message: 'Airdrop removed' });
  } catch (error) {
    console.error('Error deleting airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tracking', async (req, res) => {
  try {
    const { userId, airdropId } = req.body;

    if (!userId || !airdropId) {
      return res.status(400).json({ message: 'User ID and Airdrop ID are required' });
    }

    console.log('Tracking airdrop:', { userId, airdropId, airdropIdType: typeof airdropId });

    // Find or create tracking for this user
    let tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      tracking = new Tracking({
        userId,
        airdropIds: [],
      });
    }

    // Convert airdropIds to strings for comparison
    const airdropIdStr = String(airdropId);
    const existingIds = tracking.airdropIds.map(id => String(id));

    // Check if airdrop is already tracked
    if (existingIds.includes(airdropIdStr)) {
      return res.status(400).json({ message: 'Airdrop already tracked by user' });
    }

    // Add airdrop to tracking
    tracking.airdropIds.push(airdropId);
    await tracking.save();

    res.status(201).json({ message: 'Airdrop tracked successfully' });
  } catch (error) {
    console.error('Error tracking airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tracking', async (req, res) => {
  try {
    const { userId, airdropId } = req.body;

    if (!userId || !airdropId) {
      return res.status(400).json({ message: 'User ID and Airdrop ID are required' });
    }

    console.log('Untracking airdrop:', { userId, airdropId, airdropIdType: typeof airdropId });

    // Find tracking for this user
    const tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      return res.status(404).json({ message: 'No tracking found for this user' });
    }

    // Convert airdropId to string for comparison
    const airdropIdStr = String(airdropId);

    // Remove airdrop from tracking
    tracking.airdropIds = tracking.airdropIds.filter(id => String(id) !== airdropIdStr);
    await tracking.save();

    res.json({ message: 'Airdrop untracked successfully' });
  } catch (error) {
    console.error('Error untracking airdrop:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tracking/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Fetching tracked airdrops for user:', userId);

    // Find tracking for this user
    const tracking = await Tracking.findOne({ userId });

    if (!tracking || tracking.airdropIds.length === 0) {
      console.log('No tracking found or empty tracking for user:', userId);
      return res.status(200).json([]);
    }

    console.log('Found tracking with airdropIds:', tracking.airdropIds);

    // Get all airdrops
    const allAirdrops = await Airdrop.find({});
    console.log(`Found ${allAirdrops.length} total airdrops`);

    // Filter airdrops by _id (MongoDB ObjectID)
    const trackedAirdrops = allAirdrops.filter(airdrop => {
      // Convert airdrop._id to string for comparison
      const airdropIdStr = airdrop._id.toString();
      // Check if this airdrop's _id is in the tracking.airdropIds array
      return tracking.airdropIds.some(id => id.toString() === airdropIdStr);
    });

    console.log(`Found ${trackedAirdrops.length} tracked airdrops`);
    res.status(200).json(trackedAirdrops);
  } catch (error) {
    console.error('Error fetching tracked airdrops:', error);
    // Return empty array instead of error to prevent frontend from crashing
    res.status(200).json([]);
  }
});

// Home route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// Reset view data (for testing purposes only)
app.post('/api/reset-views', async (_req, res) => {
  try {
    // Reset view counts for all airdrops
    await Airdrop.updateMany({}, { views: 0 });

    // Clear the view tracking data
    await View.deleteMany({});

    res.json({ message: 'View data has been reset successfully' });
  } catch (error) {
    console.error('Error resetting view data:', error);
    res.status(500).json({ message: 'Failed to reset view data' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  try {
    const staticPath = path.join(__dirname, '../client/dist');
    // Check if the directory exists before setting up static serving
    if (fs.existsSync(staticPath)) {
      console.log('Serving static files from:', staticPath);
      app.use(express.static(staticPath));

      app.get('*', (_req, res) => {
        const indexPath = path.resolve(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.send('API is running, but client files are not available.');
        }
      });
    } else {
      console.log('Static directory not found:', staticPath);
      // Fallback route for all non-API routes
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.send('API is running, but client files are not available.');
        } else {
          // Continue to next middleware for API routes
          res.status(404).json({ message: 'API endpoint not found' });
        }
      });
    }
  } catch (error) {
    console.error('Error setting up static file serving:', error);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
