const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Airdrop = require('../models/airdropModel');

// Read airdrops from JSON file
const loadAirdropsFromFile = () => {
  try {
    const dataPath = path.join(__dirname, '../airdrops.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      return data.airdrops || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading data from file:', error);
    return [];
  }
};

// Check if database needs seeding and seed if necessary
const checkAndSeedDatabase = async () => {
  try {
    // Check if database already has airdrops
    const existingCount = await Airdrop.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} airdrops. Skipping seed.`);
      return;
    }

    console.log('No airdrops found in database. Seeding...');

    // Load airdrops from file
    const airdrops = loadAirdropsFromFile();
    if (airdrops.length === 0) {
      console.log('No airdrops found in file. Creating sample airdrop.');

      // Create a sample airdrop
      const sampleAirdrop = {
        airdropId: 1,
        title: 'Sample Airdrop',
        description: 'This is a sample airdrop created during database seeding.',
        token: 'SAMPLE',
        criteria: 'No specific criteria for this sample airdrop.',
        deadline: '2023-12-31',
        startDate: '2023-01-01',
        status: 'active',
        costType: 'free',
        link: 'https://example.com',
        claimUrl: 'https://example.com/claim',
        logoUrl: 'https://via.placeholder.com/150',
        cardColor: '#3498db',
        predefinedColor: 'blue',
        socialLinks: {
          website: 'https://example.com',
          discord: '',
          twitter: '',
          telegram: '',
          github: '',
          instagram: ''
        },
        views: 0
      };

      await Airdrop.create(sampleAirdrop);
      console.log('Sample airdrop created successfully.');
    } else {
      // Insert airdrops from file
      console.log(`Seeding database with ${airdrops.length} airdrops...`);

      // Map airdrops to include airdropId
      const mappedAirdrops = airdrops.map((airdrop, index) => ({
        ...airdrop,
        airdropId: airdrop._id || index + 1,
        socialLinks: airdrop.socialLinks || {
          website: '',
          discord: '',
          twitter: '',
          telegram: '',
          github: '',
          instagram: ''
        }
      }));

      await Airdrop.insertMany(mappedAirdrops);
      console.log(`${airdrops.length} airdrops seeded successfully.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// For direct execution via npm run seed
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  const path = require('path');

  // Load environment variables
  dotenv.config({ path: path.join(__dirname, '../.env') });

  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('MongoDB Connected for seeding');
      await checkAndSeedDatabase();
      await mongoose.disconnect();
      console.log('Database connection closed.');
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);
    });
}

module.exports = {
  checkAndSeedDatabase
};
