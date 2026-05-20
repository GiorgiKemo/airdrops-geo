import { useState } from 'react';
import { airdropService } from '../services/api';
import { isValidUrl, normalizeUrl } from '../utils/validation';

const LogoUpdater = ({ airdropId, onUpdate }) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const normalizedLogoUrl = normalizeUrl(logoUrl);

    if (!isValidUrl(normalizedLogoUrl, { required: true })) {
      setLoading(false);
      setError('Please enter a valid logo URL');
      return;
    }

    try {
      await airdropService.updateAirdrop(airdropId, {
        logoUrl: normalizedLogoUrl,
        skipTelegramNotification: true,
        sendTelegramNotification: false
      });
      setSuccess('Logo URL updated successfully!');
      if (onUpdate) onUpdate();
      // Clear the input
      setLogoUrl('');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Permission denied: Only admin can update logos');
      } else {
        setError('Failed to update logo URL');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Update Logo URL</h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-2 mb-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 p-2 mb-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>For Imgur images, use direct links: https://i.imgur.com/[IMAGE_ID].jpg</p>
        <p>Example: https://i.imgur.com/4KVNKw1.jpg</p>
      </div>
    </div>
  );
};

export default LogoUpdater;
