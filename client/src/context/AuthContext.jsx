import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
          // Verify the token with the server
          const { data } = await axios.get(`${API_URL}/verify`);
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

      const { data } = await axios.post(API_URL, {
        username,
        email,
        password
      });

      console.log('Register - Response data:', data);
      console.log('Register - User role from response:', data.role);

      // Set user with token
      setUser(data);
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
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      console.log('Login response:', data);
      console.log('User role from login:', data.role);

      // Set user with token
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      const message = err.response && err.response.data.message
        ? err.response.data.message
        : 'Login failed';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = () => {
    // Clear user data from localStorage first
    localStorage.removeItem('currentUser');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];

    // Set user state to null
    setUser(null);

    // Navigate to home page after logout
    // Use a small timeout to ensure state updates have been processed
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout
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
