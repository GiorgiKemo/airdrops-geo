import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check if user is already logged in from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize users in localStorage if they don't exist
  useEffect(() => {
    if (!localStorage.getItem('users')) {
      // Add a default admin user for testing
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Register a new user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Check if email already exists
      if (users.some(user => user.email === email)) {
        throw new Error('Email already in use');
      }

      // Check if username already exists
      if (users.some(user => user.username === username)) {
        throw new Error('Username already taken');
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        username,
        email,
        password // In a real app, this would be hashed
      };

      // Add user to the list
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Create user session (without password)
      const userSession = { id: newUser.id, username, email };

      // Log user in
      setUser(userSession);
      setLoading(false);
      return userSession;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Login user with either email or username
  const login = async (emailOrUsername, password) => {
    setLoading(true);
    setError(null);

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Find user with matching email or username
      const user = users.find(user =>
        user.email === emailOrUsername || user.username === emailOrUsername
      );

      // Check if user exists and password matches
      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Create user session (without password)
      const userSession = { id: user.id, username: user.username, email: user.email };

      // Log user in
      setUser(userSession);
      setLoading(false);
      return userSession;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
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
