const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestAirdrop() {
  try {
    const airdropData = {
      title: 'Test Social Links Airdrop',
      description: 'This is a test airdrop to verify social links functionality',
      token: 'TEST',
      criteria: 'Test criteria',
      deadline: '2025-12-31',
      startDate: '2025-01-01',
      status: 'upcoming',
      costType: 'free',
      link: 'https://example.com',
      socialLinks: {
        website: 'https://example.com',
        discord: 'https://discord.gg/test',
        twitter: 'https://twitter.com/test',
        telegram: '',
        github: '',
        instagram: ''
      }
    };

    console.log('Sending airdrop data with social links:', JSON.stringify(airdropData.socialLinks, null, 2));
    
    const response = await axios.post(`${API_URL}/airdrops`, airdropData);
    console.log('Airdrop created successfully:', response.data);
    console.log('Social links in response:', JSON.stringify(response.data.socialLinks, null, 2));
    
    // Now fetch the airdrop to verify social links are saved
    const allAirdrops = await axios.get(`${API_URL}/airdrops`);
    const createdAirdrop = allAirdrops.data.find(a => a.title === 'Test Social Links Airdrop');
    
    if (createdAirdrop) {
      console.log('Retrieved airdrop:', createdAirdrop._id);
      console.log('Retrieved social links:', JSON.stringify(createdAirdrop.socialLinks, null, 2));
    } else {
      console.log('Could not find the created airdrop');
    }
    
  } catch (error) {
    console.error('Error creating test airdrop:', error.response ? error.response.data : error.message);
  }
}

createTestAirdrop();
