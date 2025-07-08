import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateField, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/validation';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      errors[field] = error;
      if (error) isValid = false;
    });

    // Special case for confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear form error when user types
    if (formError) setFormError('');

    // Validate the field that changed
    const fieldError = validateField(name, value);

    // Special case for confirm password
    let confirmPasswordError = null;
    if (name === 'password' && formData.confirmPassword) {
      confirmPasswordError = value !== formData.confirmPassword ? 'Passwords do not match' : null;
    } else if (name === 'confirmPassword') {
      confirmPasswordError = value !== formData.password ? 'Passwords do not match' : null;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError,
      ...(confirmPasswordError !== null && name === 'password' ? { confirmPassword: confirmPasswordError } : {}),
      ...(name === 'confirmPassword' ? { confirmPassword: confirmPasswordError } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      // Find the first error to display as the main form error
      const firstError = Object.values(formErrors).find(error => error !== null);
      setFormError(firstError || 'Please fix the errors in the form');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/'); // Redirect to homepage after registration
    } catch (err) {
      const message = err.message || 'Registration failed';
      setFormError(message);

      // Check for specific error types and update field errors
      if (message.includes('Email already in use')) {
        setFormErrors(prev => ({ ...prev, email: 'Email already in use' }));
      } else if (message.includes('Username already taken')) {
        setFormErrors(prev => ({ ...prev, username: 'Username already taken' }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card with subtle shadow and border */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header with modern background */}
          <div className="bg-gray-900 dark:bg-black px-6 py-6">
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400 text-sm mt-1">Join our community today</p>
          </div>

          <div className="p-6">
            {/* Error message */}
            {(error || formError) && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 mb-6 rounded-lg">
                <p className="font-medium">Registration Failed</p>
                <p className="text-sm mt-1">{formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={`pl-10 w-full h-12 rounded-lg border ${formErrors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200`}
                    aria-invalid={formErrors.username ? 'true' : 'false'}
                    aria-describedby={formErrors.username ? 'username-error' : undefined}
                  />
                </div>
                {formErrors.username && (
                  <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.username}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Username must be 3-30 characters and can only contain letters, numbers, and underscores.</p>
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className={`pl-10 w-full h-12 rounded-lg border ${formErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200`}
                    aria-invalid={formErrors.email ? 'true' : 'false'}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                </div>
                {formErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 w-full h-12 rounded-lg border ${formErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200`}
                    aria-invalid={formErrors.password ? 'true' : 'false'}
                    aria-describedby={formErrors.password ? 'password-error' : 'password-requirements'}
                  />
                </div>

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor(passwordStrength)
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium" style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                )}
                <p id="password-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters and include uppercase, lowercase, and numbers.
                </p>
              </div>

              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`pl-10 w-full h-12 rounded-lg border ${formErrors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200`}
                    aria-invalid={formErrors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-gray-900 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
