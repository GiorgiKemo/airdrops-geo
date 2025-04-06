const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// File path for storing airdrops data
const DATA_FILE = path.join(__dirname, 'airdrops.json');

// Load airdrops from file or initialize empty array
let airdrops = [];
let nextId = 1;

// User tracking data structure: { userId: [airdropIds] }
let userTracking = {};

// IP address view tracking: { airdropId: [ipAddresses] }
let viewTracking = {};

// Try to load existing data
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    airdrops = data.airdrops || [];

    // Add costType field to existing airdrops if missing
    airdrops = airdrops.map(airdrop => {
      if (!airdrop.costType) {
        return { ...airdrop, costType: 'free' }; // Default to free for backward compatibility
      }
      return airdrop;
    });

    nextId = data.nextId || 1;
    userTracking = data.userTracking || {};
    viewTracking = data.viewTracking || {};
    console.log(`Loaded ${airdrops.length} airdrops, tracking data for ${Object.keys(userTracking).length} users, and view data for ${Object.keys(viewTracking).length} airdrops from file`);
  }
} catch (error) {
  console.error('Error loading data from file:', error);
  // Continue with empty array if file can't be read
}

// Function to save data to file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ airdrops, nextId, userTracking, viewTracking }, null, 2));
    console.log(`Saved ${airdrops.length} airdrops, tracking data for ${Object.keys(userTracking).length} users, and view data for ${Object.keys(viewTracking).length} airdrops to file`);
  } catch (error) {
    console.error('Error saving data to file:', error);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Airdrop routes
app.get('/api/airdrops', (req, res) => {
  // Return all airdrops without sorting
  res.json(airdrops);
});

app.get('/api/airdrops/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = airdrops.findIndex(a => a._id === id);

  if (index !== -1) {
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Initialize view tracking for this airdrop if it doesn't exist
    if (!viewTracking[id]) {
      viewTracking[id] = [];
    }

    // Only increment views if this IP hasn't viewed this airdrop before
    if (!viewTracking[id].includes(clientIp)) {
      // Increment views counter
      airdrops[index].views = (airdrops[index].views || 0) + 1;

      // Add IP to the tracking list
      viewTracking[id].push(clientIp);

      // Save data to file (to persist view count)
      saveData();

      console.log(`New view from IP ${clientIp} for airdrop ${id}`);
    } else {
      console.log(`Duplicate view from IP ${clientIp} for airdrop ${id} - not counting`);
    }

    res.json(airdrops[index]);
  } else {
    res.status(404).json({ message: 'Airdrop not found' });
  }
});

app.post('/api/airdrops', (req, res) => {
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

    const newAirdrop = {
      _id: nextId++,
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    airdrops.push(newAirdrop);

    // Save data to file
    saveData();

    res.status(201).json(newAirdrop);
  } catch (error) {
    console.error('Error creating airdrop:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/airdrops/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = airdrops.findIndex(a => a._id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    const { title, description, token, criteria, deadline, startDate, status, costType, link, claimUrl, logoUrl, cardColor, predefinedColor, socialLinks } = req.body;

    console.log('Social Links in PUT:', socialLinks);
    console.log('Social Links type in PUT:', typeof socialLinks);

    // Check if this is a logo update request
    const isLogoUpdateOnly = Object.keys(req.body).length === 1 && logoUrl !== undefined;

    // If it's a logo update, check for admin authorization
    if (isLogoUpdateOnly) {
      // Get the authorization header
      const authHeader = req.headers.authorization;

      // Simple admin check - in a real app, you'd use proper authentication
      // This is a basic example that checks for a specific username in the header
      if (!authHeader || !authHeader.includes('admin')) {
        return res.status(403).json({ message: 'Only admin can update logos' });
      }
    }

    // Preserve the current view count
    const currentViews = airdrops[index].views || 0;

    // Ensure socialLinks is properly structured
    const cleanedSocialLinks = socialLinks !== undefined ? {
      website: socialLinks?.website || '',
      discord: socialLinks?.discord || '',
      twitter: socialLinks?.twitter || '',
      telegram: socialLinks?.telegram || '',
      github: socialLinks?.github || '',
      instagram: socialLinks?.instagram || ''
    } : (airdrops[index].socialLinks || {
      website: '',
      discord: '',
      twitter: '',
      telegram: '',
      github: '',
      instagram: ''
    });

    console.log('Cleaned social links for update:', cleanedSocialLinks);

    // Update the airdrop
    airdrops[index] = {
      ...airdrops[index],
      title: title || airdrops[index].title,
      description: description || airdrops[index].description,
      token: token || airdrops[index].token,
      criteria: criteria || airdrops[index].criteria,
      deadline: deadline || airdrops[index].deadline,
      startDate: startDate || airdrops[index].startDate,
      status: status || airdrops[index].status,
      costType: costType || airdrops[index].costType || 'free', // Default to free if not provided
      link: link || airdrops[index].link,
      claimUrl: claimUrl !== undefined ? claimUrl : (airdrops[index].claimUrl || ''),
      logoUrl: logoUrl !== undefined ? logoUrl : airdrops[index].logoUrl,
      cardColor: cardColor !== undefined ? cardColor : airdrops[index].cardColor,
      predefinedColor: predefinedColor || airdrops[index].predefinedColor || 'default',
      socialLinks: cleanedSocialLinks, // Social media links
      views: currentViews, // Ensure views are preserved
      updatedAt: new Date()
    };

    // Save data to file
    saveData();

    res.json(airdrops[index]);
  } catch (error) {
    console.error('Error updating airdrop:', error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/airdrops/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = airdrops.findIndex(a => a._id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    airdrops.splice(index, 1);

    // Save data to file
    saveData();

    res.json({ message: 'Airdrop removed' });
  } catch (error) {
    console.error('Error deleting airdrop:', error);
    res.status(500).json({ message: error.message });
  }
});

// User tracking routes
app.post('/api/tracking/:userId/:airdropId', (req, res) => {
  try {
    const { userId, airdropId } = req.params;
    const airdropIdNum = parseInt(airdropId);

    // Check if airdrop exists
    const airdrop = airdrops.find(a => a._id === airdropIdNum);
    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }

    // Initialize user tracking array if it doesn't exist
    if (!userTracking[userId]) {
      userTracking[userId] = [];
    }

    // Add airdrop to user's tracking list if not already there
    if (!userTracking[userId].includes(airdropIdNum)) {
      userTracking[userId].push(airdropIdNum);
      saveData();
    }

    res.status(200).json({
      message: 'Airdrop added to tracking',
      tracking: userTracking[userId]
    });
  } catch (error) {
    console.error('Error tracking airdrop:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/tracking/:userId/:airdropId', (req, res) => {
  try {
    const { userId, airdropId } = req.params;
    const airdropIdNum = parseInt(airdropId);

    // Check if user has tracking data
    if (!userTracking[userId]) {
      return res.status(404).json({ message: 'User tracking not found' });
    }

    // Remove airdrop from user's tracking list
    userTracking[userId] = userTracking[userId].filter(id => id !== airdropIdNum);
    saveData();

    res.status(200).json({
      message: 'Airdrop removed from tracking',
      tracking: userTracking[userId]
    });
  } catch (error) {
    console.error('Error removing tracked airdrop:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tracking/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has tracking data
    if (!userTracking[userId]) {
      // Return empty array if user has no tracking data
      return res.status(200).json([]);
    }

    // Get all airdrops tracked by user
    const trackedAirdrops = airdrops.filter(airdrop =>
      userTracking[userId].includes(airdrop._id)
    );

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
app.post('/api/reset-views', (req, res) => {
  try {
    // Reset view counts for all airdrops
    airdrops.forEach(airdrop => {
      airdrop.views = 0;
    });

    // Clear the view tracking data
    viewTracking = {};

    // Save the updated data
    saveData();

    res.json({ message: 'View data has been reset successfully' });
  } catch (error) {
    console.error('Error resetting view data:', error);
    res.status(500).json({ message: 'Failed to reset view data' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
