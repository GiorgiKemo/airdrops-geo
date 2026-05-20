import axios from 'axios';

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');
const createApiBaseUrl = (rawUrl = import.meta.env.VITE_API_URL) => {
  const configuredUrl = typeof rawUrl === 'string' ? trimTrailingSlashes(rawUrl.trim()) : '';

  if (!configuredUrl) {
    return '/api';
  }

  return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`;
};

const API_URL = createApiBaseUrl();
const API_TIMEOUT_MS = 60000;
const isApiDebugEnabled = import.meta.env.VITE_DEBUG_API === 'true';
const debugLog = (...args) => {
  if (isApiDebugEnabled) {
    console.debug(...args);
  }
};

const getStoredUser = () => {
  const storedUser = localStorage.getItem('currentUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Invalid stored user data; clearing session.', error);
    localStorage.removeItem('currentUser');
    return null;
  }
};

const getApiErrorDetails = (error, extra = {}) => ({
  ...extra,
  message: error.message,
  code: error.code,
  status: error.response?.status,
  statusText: error.response?.statusText,
  method: error.config?.method?.toUpperCase(),
  url: error.config?.url,
  baseURL: error.config?.baseURL,
  data: error.response?.data,
});

const logApiError = (message, error, extra) => {
  console.error(message, getApiErrorDetails(error, extra));
};

debugLog('API URL:', API_URL);
debugLog('Environment:', import.meta.env.MODE);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Set to true to allow cookies to be sent (needed for CSRF)
  timeout: API_TIMEOUT_MS, // Allow enough time for Render free-tier cold starts
});

// Store CSRF token
let csrfToken = null;

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  // In development, just use a dummy token
  if (import.meta.env.MODE === 'development') {
    debugLog('Using dummy CSRF token for development');
    return 'development-csrf-token';
  }

  try {
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true,
      timeout: API_TIMEOUT_MS,
    });
    csrfToken = response.data.csrfToken;
    debugLog('CSRF token fetched');
    return csrfToken;
  } catch (error) {
    logApiError('Error fetching CSRF token:', error);
    return null;
  }
};

// Add request interceptor for authentication, CSRF, and debugging
api.interceptors.request.use(async config => {
  const requestUrl = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  debugLog('API request:', method.toUpperCase(), requestUrl);
  config.headers = config.headers || {};

  // Get token from localStorage
  const user = getStoredUser();

  // If token exists, add to headers
  if (user && user.token) {
    debugLog('Adding auth token to request');
    config.headers.Authorization = `Bearer ${user.token}`;
  } else {
    debugLog('No auth token found in localStorage');
  }

  // Skip CSRF for GET requests and the CSRF token endpoint itself
  if (method !== 'get' && !requestUrl.includes('/csrf-token')) {
    // Skip CSRF for forgot password and reset password endpoints
    if (requestUrl.includes('/forgot-password') || requestUrl.includes('/reset-password')) {
      debugLog('Skipping CSRF token for password reset functionality');
    } else {
      debugLog('Non-GET request detected, adding CSRF token');
      // Add CSRF token to headers if available
      if (csrfToken) {
        debugLog('Using existing CSRF token');
        config.headers['X-CSRF-Token'] = csrfToken;
      } else {
        debugLog('No CSRF token found, fetching a new one');
        // Try to fetch a new token
        const token = await fetchCsrfToken();
        if (token) {
          debugLog('New CSRF token fetched');
          config.headers['X-CSRF-Token'] = token;
        } else {
          debugLog('Failed to fetch CSRF token');
        }
      }
    }
  } else {
    debugLog('Skipping CSRF token for GET request or CSRF token endpoint');
  }

  debugLog('Making request to:', requestUrl);
  return config;
}, error => {
  logApiError('API request setup error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging and CSRF token handling
api.interceptors.response.use(response => {
  debugLog('API response:', response.status, response.config.url);

  // Update CSRF token if it's in the response headers
  const newCsrfToken = response.headers['x-csrf-token'];
  if (newCsrfToken) {
    csrfToken = newCsrfToken;
    debugLog('CSRF token updated from response headers');
  }

  return response;
}, async error => {
  debugLog('API response error:', getApiErrorDetails(error));

  // If we get a 403 Forbidden error and it mentions CSRF, try to refresh the token
  if (error.response && error.response.status === 403 &&
      error.response.data && error.response.data.message &&
      error.response.data.message.includes('CSRF')) {
    debugLog('CSRF validation failed, refreshing token...');

    // Clear the current token
    csrfToken = null;

    // Try to get a new token
    await fetchCsrfToken();

    // If we have a new token and the original request config is available, retry the request
    if (csrfToken && error.config && !error.config._csrfRetry) {
      debugLog('Retrying request with new CSRF token');
      error.config._csrfRetry = true;
      error.config.headers = error.config.headers || {};
      error.config.headers['X-CSRF-Token'] = csrfToken;
      return api(error.config);
    }
  }

  return Promise.reject(error);
});

// Airdrop API services
export const airdropService = {
  // Get all airdrops
  getAirdrops: async () => {
    const maxAttempts = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        debugLog('Fetching airdrops from:', `${API_URL}/airdrops`, { attempt, maxAttempts });
        const response = await api.get('/airdrops');
        debugLog('Airdrops response:', response);
        return response.data;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const code = error.code;
        const isRetryable =
          !status ||
          status >= 500 ||
          code === 'ECONNABORTED' ||
          code === 'ETIMEDOUT' ||
          code === 'ERR_NETWORK';

        if (attempt < maxAttempts && isRetryable) {
          // Small backoff before one retry to absorb transient cold-start/network failures
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }

        logApiError('Error fetching airdrops:', error, { attempt, maxAttempts });
        throw error;
      }
    }

    throw lastError;
  },

  // Get single airdrop by ID
  getAirdropById: async (id) => {
    try {
      const response = await api.get(`/airdrops/${id}`);
      return response.data;
    } catch (error) {
      logApiError(`Error fetching airdrop with ID ${id}:`, error);
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
      logApiError('Error creating airdrop:', error);
      throw error;
    }
  },

  // Update existing airdrop
  updateAirdrop: async (id, airdropData, headers = {}, useEditButton = false) => {
    try {
      debugLog('Updating airdrop with data:', airdropData);
      debugLog('skipTelegramNotification:', airdropData.skipTelegramNotification);

      // Make sure skipTelegramNotification is properly set
      if (airdropData.skipTelegramNotification === undefined) {
        airdropData.skipTelegramNotification = false;
      }

      // Set sendTelegramNotification to the opposite of skipTelegramNotification
      // unless it's explicitly set
      if (airdropData.sendTelegramNotification === undefined) {
        airdropData.sendTelegramNotification = !airdropData.skipTelegramNotification;
      }

      // CRITICAL FIX: Add editButton=true parameter to the URL to indicate this is an edit button update
      // This will ensure the server respects the skipTelegramNotification flag
      debugLog('useEditButton parameter:', useEditButton);
      debugLog('skipTelegramNotification:', airdropData.skipTelegramNotification);
      debugLog('sendTelegramNotification:', airdropData.sendTelegramNotification);

      // Make sure we're sending the correct notification flags
      if (airdropData.skipTelegramNotification === false) {
        airdropData.sendTelegramNotification = true;
      }

      // Add query parameters
      const queryParams = new URLSearchParams();

      // Always add editButton=true if useEditButton is true or for status changes
      if (useEditButton || airdropData.status) {
        debugLog('Adding editButton=true parameter');
        queryParams.append('editButton', 'true');
      }

      // If skipTelegramNotification is false, also add notifyTelegram=true to force a notification
      // But only if we're not doing a status change from the detail page
      if (airdropData.skipTelegramNotification === false && !airdropData.status) {
        debugLog('Adding notifyTelegram=true parameter');
        queryParams.append('notifyTelegram', 'true');
      }

      const response = await api.put(`/airdrops/${id}?${queryParams.toString()}`, airdropData, { headers });
      return response.data;
    } catch (error) {
      logApiError(`Error updating airdrop with ID ${id}:`, error);
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
      debugLog('API Service - Adding airdrop update with skipTelegramNotification:', skipTelegramNotification);
      debugLog('API Service - skipTelegramNotification type:', typeof skipTelegramNotification);

      // IMPORTANT: Use double negation to ensure it's a true boolean
      // This is more reliable than strict comparison for boolean conversion
      const skipTelegram = !!skipTelegramNotification;

      // Always set sendTelegramNotification to the opposite of skipTelegramNotification
      const sendTelegram = !skipTelegram;

      debugLog('API Service - Final values being sent to server:');
      debugLog('API Service - skipTelegramNotification (processed):', skipTelegram, 'type:', typeof skipTelegram);
      debugLog('API Service - sendTelegramNotification:', sendTelegram, 'type:', typeof sendTelegram);

      const response = await api.post(`/airdrops/${id}/updates`, {
        content: updateContent,
        sendTelegramNotification: sendTelegram,
        skipTelegramNotification: skipTelegram
      }, { headers });

      debugLog('Airdrop update response:', response.data);
      return response.data;
    } catch (error) {
      logApiError(`Error adding update to airdrop with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete airdrop
  deleteAirdrop: async (id) => {
    try {
      const response = await api.delete(`/airdrops/${id}`);
      return response.data;
    } catch (error) {
      logApiError(`Error deleting airdrop with ID ${id}:`, error);
      throw error;
    }
  },
};

export default api;
