import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/validation';

const ForgotPasswordStandalone = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setError('');
    const trimmedEmail = email.trim();

    // Basic validation
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending password reset request for email:', trimmedEmail);

      const response = await api.post('/users/forgot-password', { email: trimmedEmail });

      console.log('Password reset API call successful');
      console.log('Response:', response.data);

      // Show success toast notification
      toast.success('Password reset link sent. Please check your email.');

      setSubmittedEmail(trimmedEmail);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error requesting password reset:', err);

      let errorMessage = 'An error occurred. Please try again later.';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      // Set error state for form display
      setError(errorMessage);

      // Show error toast notification
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {!isSubmitted ? 'Enter your email to receive a password reset link' : 'Check your email for reset instructions'}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="your@email.com"
                  required
                  aria-invalid={error ? 'true' : 'false'}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                If an account exists with the email <span className="font-semibold">{submittedEmail}</span>, you will receive password reset instructions.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordStandalone;
