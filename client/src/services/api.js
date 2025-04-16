import axios from 'axios';

// Remove trailing slash if present
const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : 'http://localhost:5000';
const API_URL = `${apiUrl}/api`;

// Log the API URL for debugging
console.log('API URL:', API_URL);
console.log('Environment:', import.meta.env.MODE);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Set to true to allow cookies to be sent (needed for CSRF)
  timeout: 10000, // 10 seconds timeout
});

// Store CSRF token
let csrfToken = null;

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  // In development, just use a dummy token
  if (import.meta.env.MODE === 'development') {
    console.log('Using dummy CSRF token for development');
    return 'development-csrf-token';
  }

  try {
    const response = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
    csrfToken = response.data.csrfToken;
    console.log('CSRF token fetched:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Add request interceptor for authentication, CSRF, and debugging
api.interceptors.request.use(async config => {
  console.log('API Request interceptor called for URL:', config.url);
  // Get token from localStorage
  const user = JSON.parse(localStorage.getItem('currentUser'));

  // If token exists, add to headers
  if (user && user.token) {
    console.log('Adding auth token to request');
    config.headers.Authorization = `Bearer ${user.token}`;
  } else {
    console.log('No auth token found in localStorage');
  }

  // Skip CSRF for GET requests and the CSRF token endpoint itself
  if (config.method !== 'get' && !config.url.includes('/csrf-token')) {
    console.log('Non-GET request detected, adding CSRF token');
    // Add CSRF token to headers if available
    if (csrfToken) {
      console.log('Using existing CSRF token:', csrfToken);
      config.headers['X-CSRF-Token'] = csrfToken;
    } else {
      console.log('No CSRF token found, fetching a new one');
      // Try to fetch a new token
      const token = await fetchCsrfToken();
      if (token) {
        console.log('New CSRF token fetched:', token);
        config.headers['X-CSRF-Token'] = token;
      } else {
        console.log('Failed to fetch CSRF token');
      }
    }
  } else {
    console.log('Skipping CSRF token for GET request or CSRF token endpoint');
  }

  console.log('Making request to:', config.url);
  console.log('Request config:', config);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging and CSRF token handling
api.interceptors.response.use(response => {
  console.log('Response received from:', response.config.url);
  console.log('Response status:', response.status);
  console.log('Response data:', response.data);

  // Update CSRF token if it's in the response headers
  const newCsrfToken = response.headers['x-csrf-token'];
  if (newCsrfToken) {
    csrfToken = newCsrfToken;
    console.log('CSRF token updated from response headers');
  }

  return response;
}, async error => {
  console.error('Response error:', error);
  console.error('Error response:', error.response);
  console.error('Error request:', error.request);
  console.error('Error config:', error.config);

  // If we get a 403 Forbidden error and it mentions CSRF, try to refresh the token
  if (error.response && error.response.status === 403 &&
      error.response.data && error.response.data.message &&
      error.response.data.message.includes('CSRF')) {
    console.log('CSRF validation failed, refreshing token...');

    // Clear the current token
    csrfToken = null;

    // Try to get a new token
    await fetchCsrfToken();

    // If we have a new token and the original request config is available, retry the request
    if (csrfToken && error.config) {
      console.log('Retrying request with new CSRF token');
      error.config.headers['X-CSRF-Token'] = csrfToken;
      return axios(error.config);
    }
  }

  return Promise.reject(error);
});

// Airdrop API services
export const airdropService = {
  // Get all airdrops
  getAirdrops: async () => {
    try {
      console.log('Fetching airdrops from:', `${API_URL}/airdrops`);
      const response = await api.get('/airdrops');
      console.log('Airdrops response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching airdrops:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get single airdrop by ID
  getAirdropById: async (id) => {
    try {
      const response = await api.get(`/airdrops/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching airdrop with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new airdrop
  createAirdrop: async (airdropData, skipNotification = false) => {
    try {
      // If skipNotification is true, add skipTelegramNotification flag
      if (skipNotification) {
        airdropData.skipTelegramNotification = true;
      }
      const response = await api.post('/airdrops', airdropData);
      return response.data;
    } catch (error) {
      console.error('Error creating airdrop:', error);
      throw error;
    }
  },

  // Update existing airdrop
  updateAirdrop: async (id, airdropData, headers = {}) => {
    try {
      const response = await api.put(`/airdrops/${id}`, airdropData, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating airdrop with ID ${id}:`, error);
      throw error;
    }
  },

  // Add an update to an airdrop
  addAirdropUpdate: async (id, updateContent, skipTelegramNotification = false) => {
    try {
      // Get auth token from localStorage
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(currentUser);
      const token = user.token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set the Authorization header
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Set sendTelegramNotification based on skipTelegramNotification flag
      const response = await api.post(`/airdrops/${id}/updates`, {
        content: updateContent,
        sendTelegramNotification: !skipTelegramNotification,
        skipTelegramNotification: skipTelegramNotification
      }, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error adding update to airdrop with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete airdrop
  deleteAirdrop: async (id) => {
    try {
      const response = await api.delete(`/airdrops/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting airdrop with ID ${id}:`, error);
      throw error;
    }
  },
};

// Initialize CSRF token when the module is imported
fetchCsrfToken();

export default api;
