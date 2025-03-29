const axios = require('axios');

// Function to make a login request
async function makeLoginRequest(attempt) {
  try {
    const response = await axios.post('http://localhost:5000/api/users/login', {
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    console.log(`Attempt ${attempt}: Success - Status ${response.status}`);
    return response;
  } catch (error) {
    if (error.response) {
      console.log(`Attempt ${attempt}: Failed - Status ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`);
      return error.response;
    } else {
      console.log(`Attempt ${attempt}: Error - ${error.message}`);
      throw error;
    }
  }
}

// Function to run the test
async function runTest() {
  console.log('Starting rate limit test...');
  console.log('Making 7 login requests in quick succession...');
  
  // Make 7 requests (should hit the rate limit after 5)
  for (let i = 1; i <= 7; i++) {
    await makeLoginRequest(i);
    // Small delay to avoid network issues
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Test completed.');
}

// Run the test
runTest();
