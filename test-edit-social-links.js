const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEditSocialLinks() {
  try {
    // First, get the airdrop with ID 21
    const response = await axios.get(`${API_URL}/airdrops/21`);
    const airdrop = response.data;
    
    console.log('Original airdrop:', airdrop);
    console.log('Original social links:', airdrop.socialLinks);
    
    // Update the social links
    const updatedAirdrop = {
      ...airdrop,
      socialLinks: {
        ...airdrop.socialLinks,
        github: 'https://github.com/test-repo',  // Add GitHub link
        instagram: 'https://instagram.com/test'  // Add Instagram link
      }
    };
    
    console.log('Updating airdrop with social links:', updatedAirdrop.socialLinks);
    
    // Send the update request
    const updateResponse = await axios.put(`${API_URL}/airdrops/21`, updatedAirdrop);
    console.log('Update response:', updateResponse.data);
    console.log('Updated social links:', updateResponse.data.socialLinks);
    
    // Verify the update by fetching the airdrop again
    const verifyResponse = await axios.get(`${API_URL}/airdrops/21`);
    console.log('Verified airdrop:', verifyResponse.data);
    console.log('Verified social links:', verifyResponse.data.socialLinks);
    
  } catch (error) {
    console.error('Error testing social links edit:', error.response ? error.response.data : error.message);
  }
}

testEditSocialLinks();
