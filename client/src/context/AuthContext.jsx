import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

// API URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : 'http://localhost:5000';
const API_URL = `${apiUrl}/api/users`;

export const AuthProvider = ({ children }) => {
  // Check if user is already logged in from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;

        try {
          // Verify the token with the server using our API service
          const { data } = await api.get('/users/verify-token');
          console.log('Token verification response:', data);
          console.log('User role from server:', data.role);

          // IMPORTANT: Always use the server's response to set the user state
          // This ensures that if someone tampers with localStorage, their role will be corrected
          setUser(data);

          // Update localStorage with the verified data from server
          localStorage.setItem('currentUser', JSON.stringify(data));
        } catch (error) {
          // If token verification fails, log the user out
          console.error('Token verification failed:', error);
          setUser(null);
          localStorage.removeItem('currentUser');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    };

    verifyToken();
  }, []);

  // Update localStorage and set auth header when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Set auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      localStorage.removeItem('currentUser');
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Register a new user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Register - Sending request with data:', { username, email });

      // Use our API service which includes CSRF token handling
      const { data } = await api.post('/users/register', {
        username,
        email,
        password
      });

      console.log('Register - Response data:', data);
      console.log('Register - User role from response:', data.role);

      // Set user with token
      setUser(data);

      // Immediately verify token to get full profile data
      try {
        console.log('Verifying token to get full profile data after registration');

        // Set auth header for the verification request
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        const verifyResponse = await api.get('/users/verify-token');
        console.log('Token verification response after registration:', verifyResponse.data);

        // Update user with complete profile data
        setUser(verifyResponse.data);

        // Save the complete user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(verifyResponse.data));
      } catch (verifyError) {
        console.error('Error verifying token after registration:', verifyError);
        // Continue with basic user data if verification fails
      }

      setLoading(false);
      return data;
    } catch (err) {
      const message = err.response && err.response.data.message
        ? err.response.data.message
        : 'Registration failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Login user
  const login = async (email, password) => {
    console.log('AuthContext login function called with email:', email);
    setLoading(true);
    setError(null);

    try {
      console.log('Making API request to /users/login');
      // Use our API service which includes CSRF token handling
      const { data } = await api.post(`/users/login`, {
        email,
        password
      });

      console.log('Login response:', data);
      console.log('User role from login:', data.role);

      // Set user with token
      setUser(data);

      // Immediately verify token to get full profile data
      try {
        console.log('Verifying token to get full profile data');

        // Set auth header for the verification request
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        const verifyResponse = await api.get('/users/verify-token');
        console.log('Token verification response:', verifyResponse.data);

        // Update user with complete profile data
        setUser(verifyResponse.data);

        // Save the complete user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(verifyResponse.data));
      } catch (verifyError) {
        console.error('Error verifying token after login:', verifyError);
        // Continue with basic user data if verification fails
      }

      setLoading(false);
      return data;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      const message = err.response && err.response.data.message
        ? err.response.data.message
        : 'Login failed';
      console.error('Setting error message:', message);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Updating user profile with data:', profileData);

      // Use our API service which includes CSRF token handling
      const { data } = await api.put('/users/profile', profileData);

      console.log('Profile update response:', data);

      // Update user state with new profile data
      setUser(prev => ({
        ...prev,
        ...data
      }));

      setLoading(false);
      return data;
    } catch (err) {
      console.error('Profile update error:', err);
      const message = err.response && err.response.data.message
        ? err.response.data.message
        : 'Profile update failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Updating user password');

      // Use our API service which includes CSRF token handling
      const { data } = await api.put('/users/password', {
        currentPassword,
        newPassword
      });

      console.log('Password update response:', data);

      setLoading(false);
      return data;
    } catch (err) {
      console.error('Password update error:', err);
      const message = err.response && err.response.data.message
        ? err.response.data.message
        : 'Password update failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = (redirectToHome = true) => {
    console.log('AuthContext: logout called with redirectToHome =', redirectToHome);

    // Check if user is already logged out
    const currentUser = localStorage.getItem('currentUser');
    console.log('AuthContext: currentUser in localStorage =', currentUser ? 'exists' : 'null');

    // Clear user data from localStorage first
    localStorage.removeItem('currentUser');
    console.log('AuthContext: removed currentUser from localStorage');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    console.log('AuthContext: removed Authorization header');

    // Set user state to null
    setUser(null);
    console.log('AuthContext: set user state to null');

    // Navigate to home page after logout only if redirectToHome is true
    if (redirectToHome) {
      console.log('AuthContext: redirectToHome is true, will redirect to home page');
      // Use a small timeout to ensure state updates have been processed
      setTimeout(() => {
        console.log('AuthContext: redirecting to home page now');
        window.location.href = '/';
      }, 100);
    } else {
      console.log('AuthContext: redirectToHome is false, staying on current page');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      updateProfile,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
