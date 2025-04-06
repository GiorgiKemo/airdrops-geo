import axios from 'axios';

// Remove trailing slash if present
const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : 'http://localhost:5000';
const API_URL = `${apiUrl}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tracking service
export const trackingService = {
  // Get all tracked airdrops for a user
  getTrackedAirdrops: async (userId) => {
    try {
      const response = await api.get(`/tracking/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tracked airdrops:', error);
      throw error;
    }
  },

  // Add an airdrop to user's tracking
  trackAirdrop: async (userId, airdropId) => {
    try {
      const response = await api.post(`/tracking/${userId}/${airdropId}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking airdrop:', error);
      throw error;
    }
  },

  // Remove an airdrop from user's tracking
  untrackAirdrop: async (userId, airdropId) => {
    try {
      const response = await api.delete(`/tracking/${userId}/${airdropId}`);
      return response.data;
    } catch (error) {
      console.error('Error untracking airdrop:', error);
      throw error;
    }
  },
};

export default trackingService;
