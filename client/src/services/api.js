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
  createAirdrop: async (airdropData) => {
    try {
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

export default api;
