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
  withCredentials: false,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  console.log('Tracking service - Making request to:', config.url);
  return config;
}, error => {
  console.error('Tracking service - Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(response => {
  console.log('Tracking service - Response received:', response);
  return response;
}, error => {
  console.error('Tracking service - Response error:', error);
  return Promise.reject(error);
});

// Tracking service
export const trackingService = {
  // Get all tracked airdrops for a user
  getTrackedAirdrops: async () => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Set the Authorization header
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const response = await api.get('/tracking', { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching tracked airdrops:', error);
      throw error;
    }
  },

  // Add an airdrop to user's tracking
  trackAirdrop: async (userId, airdropId) => {
    try {
      console.log('Tracking airdrop:', { userId, airdropId });
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Set the Authorization header
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Send the request with the airdropId in the URL
      const response = await api.post(`/tracking/${airdropId}`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error tracking airdrop:', error);
      throw error;
    }
  },

  // Remove an airdrop from user's tracking
  untrackAirdrop: async (userId, airdropId) => {
    try {
      console.log('Untracking airdrop:', { userId, airdropId });
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Set the Authorization header
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Send the request with the airdropId in the URL
      const response = await api.delete(`/tracking/${airdropId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error untracking airdrop:', error);
      throw error;
    }
  },
};

export default trackingService;
