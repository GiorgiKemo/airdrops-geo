const axios = require('axios');

// Create a test airdrop
const testAirdrop = {
  title: 'API Test Airdrop',
  description: 'This is a test airdrop created via API',
  token: 'TEST',
  criteria: 'Testing purposes only',
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
  }
};

// Send the request to create the airdrop
async function createTestAirdrop() {
  try {
    console.log('Sending request to create test airdrop...');
    const response = await axios.post('http://localhost:5000/api/airdrops', testAirdrop);
    console.log('Airdrop created successfully!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error creating airdrop:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the function
createTestAirdrop();
