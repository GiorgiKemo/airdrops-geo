const telegramService = require('./services/telegramService');

// Create a test airdrop object
const testAirdrop = {
  airdropId: 999,
  title: 'Test Airdrop',
  description: 'This is a test airdrop to verify Telegram integration',
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
  },
  views: 0
};

// Test the Telegram integration
async function testTelegramIntegration() {
  console.log('Testing Telegram integration...');
  
  try {
    // Send the test airdrop to Telegram
    const result = await telegramService.sendAirdropToTelegram(testAirdrop);
    
    if (result) {
      console.log('✅ Test successful! The airdrop was posted to Telegram.');
    } else {
      console.log('❌ Test failed. The airdrop was not posted to Telegram.');
    }
  } catch (error) {
    console.error('❌ Test failed with an error:', error);
  }
}

// Run the test
testTelegramIntegration();
