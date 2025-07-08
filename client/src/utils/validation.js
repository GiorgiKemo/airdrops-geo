/**
 * Validation utility functions for forms
 */

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a username
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUsername = (username) => {
  // Username must be 3-30 characters and only contain letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Calculates password strength on a scale of 0-5
 * @param {string} password - Password to check
 * @returns {number} Strength score (0-5)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 1;
  
  // Contains numbers
  if (/[0-9]/.test(password)) strength += 1;
  
  // Contains special characters
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return strength;
};

/**
 * Gets a descriptive label for password strength
 * @param {number} strength - Password strength score (0-5)
 * @returns {string} Descriptive label
 */
export const getPasswordStrengthLabel = (strength) => {
  switch (strength) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    case 5: return 'Very Strong';
    default: return 'Unknown';
  }
};

/**
 * Gets a color for password strength
 * @param {number} strength - Password strength score (0-5)
 * @returns {string} CSS color value
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0: return '#ff0000'; // Red
    case 1: return '#ff4500'; // OrangeRed
    case 2: return '#ffa500'; // Orange
    case 3: return '#ffff00'; // Yellow
    case 4: return '#9acd32'; // YellowGreen
    case 5: return '#008000'; // Green
    default: return '#cccccc'; // Gray
  }
};

/**
 * Validates a password against requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a form field
 * @param {string} name - Field name
 * @param {string} value - Field value
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (name, value) => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      if (!isValidEmail(value)) return 'Please enter a valid email address';
      return null;
      
    case 'username':
      if (!value) return 'Username is required';
      if (!isValidUsername(value)) return 'Username must be 3-30 characters and can only contain letters, numbers, and underscores';
      return null;
      
    case 'password':
      if (!value) return 'Password is required';
      const { isValid, errors } = validatePassword(value);
      return isValid ? null : errors[0];
      
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      return null;
      
    default:
      return null;
  }
};
