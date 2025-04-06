const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import seed function
const seedDatabase = require('./scripts/seedDatabase');

// Connect to MongoDB and seed database
connectDB().then(() => {
  // Check if we need to seed the database
  seedDatabase.checkAndSeedDatabase();
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
app.get('/api/airdrops', async (req, res) => {
  try {
    const airdrops = await Airdrop.find({});
    res.json(airdrops);
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/airdrops/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const airdrop = await Airdrop.findOne({ airdropId: id });

    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Find or create view tracking for this airdrop
    let viewTracking = await View.findOne({ airdropId: id });

    if (!viewTracking) {
      viewTracking = new View({
        airdropId: id,
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

      console.log(`New view from IP ${clientIp} for airdrop ${id}`);
    } else {
      console.log(`Duplicate view from IP ${clientIp} for airdrop ${id} - not counting`);
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
    const id = parseInt(req.params.id);
    const airdrop = await Airdrop.findOne({ airdropId: id });

    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    const { title, description, token, criteria, deadline, startDate, status, costType, link, claimUrl, logoUrl, cardColor, predefinedColor, socialLinks } = req.body;

    console.log('Social Links in PUT:', socialLinks);
    console.log('Social Links type in PUT:', typeof socialLinks);

    // Check if this is a logo update request
    const isLogoUpdateOnly = Object.keys(req.body).length === 1 && logoUrl !== undefined;

    // If it's not just a logo update, validate required fields
    if (!isLogoUpdateOnly && (!title || !description || !token || !criteria || !deadline || !status || !link)) {
      return res.status(400).json({ message: 'All fields are required' });
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
      airdrop.logoUrl = logoUrl;
    } else {
      airdrop.title = title;
      airdrop.description = description;
      airdrop.token = token;
      airdrop.criteria = criteria;
      airdrop.deadline = deadline;
      airdrop.startDate = startDate || airdrop.startDate;
      airdrop.status = status;
      airdrop.costType = costType || airdrop.costType;
      airdrop.link = link;
      airdrop.claimUrl = claimUrl || airdrop.claimUrl;
      airdrop.logoUrl = logoUrl || airdrop.logoUrl;
      airdrop.cardColor = cardColor || airdrop.cardColor;
      airdrop.predefinedColor = predefinedColor || airdrop.predefinedColor;
      airdrop.socialLinks = cleanedSocialLinks;
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
    const id = parseInt(req.params.id);
    const airdrop = await Airdrop.findOne({ airdropId: id });

    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    await Airdrop.deleteOne({ airdropId: id });

    // Also delete any view tracking for this airdrop
    await View.deleteOne({ airdropId: id });

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

    // Find or create tracking for this user
    let tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      tracking = new Tracking({
        userId,
        airdropIds: [],
      });
    }

    // Check if airdrop is already tracked
    if (tracking.airdropIds.includes(airdropId)) {
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

    // Find tracking for this user
    const tracking = await Tracking.findOne({ userId });

    if (!tracking) {
      return res.status(404).json({ message: 'No tracking found for this user' });
    }

    // Remove airdrop from tracking
    tracking.airdropIds = tracking.airdropIds.filter(id => id !== airdropId);
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

    // Find tracking for this user
    const tracking = await Tracking.findOne({ userId });

    if (!tracking || tracking.airdropIds.length === 0) {
      return res.status(200).json([]);
    }

    // Get all airdrops tracked by user
    const trackedAirdrops = await Airdrop.find({ airdropId: { $in: tracking.airdropIds } });

    res.status(200).json(trackedAirdrops);
  } catch (error) {
    console.error('Error fetching tracked airdrops:', error);
    res.status(500).json({ message: error.message });
  }
});

// Home route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Reset view data (for testing purposes only)
app.post('/api/reset-views', async (req, res) => {
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
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
