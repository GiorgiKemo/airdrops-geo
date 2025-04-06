import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
      const response = await api.get('/airdrops');
      return response.data;
    } catch (error) {
      console.error('Error fetching airdrops:', error);
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
