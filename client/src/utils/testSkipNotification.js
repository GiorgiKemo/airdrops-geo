import { airdropService } from '../services/api';

// Function to test creating an airdrop with skipTelegramNotification=true
export const testCreateAirdropWithSkipNotification = async () => {
  try {
    const airdropData = {
      title: 'Test Skip Notification',
      description: 'This is a test airdrop with skipTelegramNotification=true',
      token: 'TEST',
      criteria: 'Test criteria for skip notification',
      deadline: '2025-12-31',
      status: 'upcoming',
      link: 'https://example.com',
    };
    
    // Create airdrop with skipNotification=true
    const result = await airdropService.createAirdrop(airdropData, true);
    console.log('Created airdrop with skipTelegramNotification=true:', result);
    return result;
  } catch (error) {
    console.error('Error in testCreateAirdropWithSkipNotification:', error);
    throw error;
  }
};
