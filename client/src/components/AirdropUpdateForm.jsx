import { useState } from 'react';
import PropTypes from 'prop-types';

const AirdropUpdateForm = ({ onSubmit, onCancel, loading }) => {
  const [updateContent, setUpdateContent] = useState('');
  const [skipTelegramNotification, setSkipTelegramNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!updateContent.trim()) {
      setError('Update content is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // IMPORTANT: Log the current state of the checkbox before processing
      console.log('FORM SUBMISSION - Current checkbox state:', skipTelegramNotification);
      console.log('FORM SUBMISSION - Checkbox state type:', typeof skipTelegramNotification);

      // Call the onSubmit function passed from parent with skipTelegramNotification flag
      // Force to boolean with strict comparison
      // IMPORTANT: Use double negation to ensure it's a true boolean
      const skipTelegram = !!skipTelegramNotification;
      console.log('FORM SUBMISSION - Processed skipTelegramNotification:', skipTelegram, 'type:', typeof skipTelegram);

      // Make sure we're passing a true boolean value
      await onSubmit(updateContent, skipTelegram);

      // Reset form
      setUpdateContent('');
      setSkipTelegramNotification(false);
    } catch (err) {
      setError(err.message || 'Failed to add update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Add Update
      </h3>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            htmlFor="updateContent"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Update Content
          </label>
          <textarea
            id="updateContent"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            placeholder="Enter update details, new tasks, or important information..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            disabled={isSubmitting || loading}
          />
        </div>

        <div className="flex items-center mb-3 p-3 border-2 border-blue-300 dark:border-blue-700 rounded bg-blue-50 dark:bg-blue-900 shadow-md">
          <input
            type="checkbox"
            id="skipTelegramNotification"
            checked={skipTelegramNotification}
            onChange={(e) => {
              // Force to boolean with double negation
              const isChecked = !!e.target.checked;
              console.log('Checkbox changed to:', isChecked, 'type:', typeof isChecked);
              console.log('Original e.target.checked:', e.target.checked, 'type:', typeof e.target.checked);
              setSkipTelegramNotification(isChecked);
            }}
            className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting || loading}
          />
          <div className="ml-2">
            <label
              htmlFor="skipTelegramNotification"
              className="block text-sm font-bold text-blue-700 dark:text-blue-300"
            >
              Skip Telegram Notification
            </label>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Check this box to prevent sending a notification to Telegram when adding this update.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            disabled={isSubmitting || loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-700 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Submitting...' : 'Add Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

AirdropUpdateForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
};

AirdropUpdateForm.defaultProps = {
  onCancel: () => {},
  loading: false
};

export default AirdropUpdateForm;
