import { useState, useEffect, useRef } from 'react';
import { airdropService } from '../services/api';
import AirdropForm from '../components/AirdropForm';
import AirdropUpdateForm from '../components/AirdropUpdateForm';
import AirdropUpdates from '../components/AirdropUpdates';
import { FaSearch, FaBell } from 'react-icons/fa';

const AdminPage = () => {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAirdrop, setEditingAirdrop] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingAirdrop, setUpdatingAirdrop] = useState(null);
  const [expandedAirdrop, setExpandedAirdrop] = useState(null);
  const formRef = useRef(null);
  const updateFormRef = useRef(null);

  // Fetch all airdrops
  const fetchAirdrops = async () => {
    try {
      setLoading(true);
      const data = await airdropService.getAirdrops();
      setAirdrops(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch airdrops. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load airdrops on component mount
  useEffect(() => {
    fetchAirdrops();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle form submission for creating a new airdrop
  const handleCreateAirdrop = async (airdropData) => {
    try {
      await airdropService.createAirdrop(airdropData);
      setSuccessMessage('Airdrop created successfully!');
      setIsAdding(false);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create airdrop. Please try again.');
      console.error(err);
    }
  };

  // Handle form submission for updating an airdrop
  const handleUpdateAirdrop = async (airdropData) => {
    try {
      await airdropService.updateAirdrop(editingAirdrop._id, airdropData);
      setSuccessMessage('Airdrop updated successfully!');
      setEditingAirdrop(null);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update airdrop. Please try again.');
      console.error(err);
    }
  };

  // Handle airdrop deletion
  const handleDeleteAirdrop = async (id) => {
    if (window.confirm('Are you sure you want to delete this airdrop? This action cannot be undone.')) {
      try {
        await airdropService.deleteAirdrop(id);
        setSuccessMessage('Airdrop deleted successfully!');
        fetchAirdrops();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete airdrop. Please try again.');
        console.error(err);
      }
    }
  };

  // Update airdrop status
  const handleStatusChange = async (id, newStatus, airdrop) => {
    try {
      // Special handling for 'claim' status
      if (newStatus === 'claim' && !airdrop.claimUrl) {
        setError('Cannot set status to "Claim" without a claim URL. Please edit the airdrop to add a claim URL first.');
        return;
      }

      // Explicitly set skipTelegramNotification to true to prevent Telegram notifications for status changes
      await airdropService.updateAirdrop(id, {
        status: newStatus,
        skipTelegramNotification: true,
        sendTelegramNotification: false
      });
      setSuccessMessage(`Airdrop status updated to ${newStatus}!`);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update airdrop status. Please try again.');
      console.error('Status update error:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  // Handle adding an update to an airdrop
  const handleAddUpdate = async (updateContent, skipTelegramNotification = false) => {
    try {
      if (!updatingAirdrop) return;

      // Force to boolean with strict comparison
      const skipTelegram = skipTelegramNotification === true ? true : false;
      console.log('AdminPage - Original skipTelegramNotification:', skipTelegramNotification, 'type:', typeof skipTelegramNotification);
      console.log('AdminPage - Processed skipTelegramNotification:', skipTelegram, 'type:', typeof skipTelegram);

      await airdropService.addAirdropUpdate(updatingAirdrop._id, updateContent, skipTelegram);
      setSuccessMessage(`Update added successfully! ${skipTelegram ? '(Telegram notification skipped)' : ''}`);
      setUpdatingAirdrop(null);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add update. Please try again.');
      console.error('Update error:', err);
    }
  };

  // Toggle expanded airdrop to show updates
  const toggleExpandAirdrop = (airdrop) => {
    if (expandedAirdrop && expandedAirdrop._id === airdrop._id) {
      setExpandedAirdrop(null);
    } else {
      setExpandedAirdrop(airdrop);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center sm:text-left">Admin Dashboard</h1>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4 text-center sm:text-left">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 text-center sm:text-left">
          {error}
        </div>
      )}

      {/* Add/Edit Form Section */}
      {(isAdding || editingAirdrop) && (
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center sm:text-left">
            {editingAirdrop ? 'Edit Airdrop' : 'Add New Airdrop'}
          </h2>
          <AirdropForm
            onSubmit={editingAirdrop ? handleUpdateAirdrop : handleCreateAirdrop}
            initialData={editingAirdrop}
          />
          <button
            onClick={() => {
              setIsAdding(false);
              setEditingAirdrop(null);
            }}
            className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Update Form Section */}
      {updatingAirdrop && (
        <div ref={updateFormRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-center sm:text-left">
            Add Update for "{updatingAirdrop.title}"
          </h2>
          <AirdropUpdateForm
            onSubmit={handleAddUpdate}
            onCancel={() => setUpdatingAirdrop(null)}
          />
        </div>
      )}

      {/* Airdrops List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingAirdrop(null);
                // Scroll to the form after a short delay to ensure it's rendered
                setTimeout(() => {
                  if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Add New Airdrop
            </button>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search airdrops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        ) : airdrops.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No airdrops found.</div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(10 * 53px + 40px)', WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Token
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Start
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3">
                    Status & Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {airdrops
                  .filter(airdrop =>
                    searchTerm === '' ||
                    airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    airdrop.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    airdrop.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  // Sort by createdAt date (newest first)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((airdrop) => (
                    <>
                      <tr key={airdrop._id}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {airdrop.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{airdrop.token}</div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              airdrop.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                : airdrop.status === 'upcoming'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                                : airdrop.status === 'claim'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(airdrop.startDate)}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Status dropdown */}
                            <select
                              value={airdrop.status}
                              onChange={(e) => handleStatusChange(airdrop._id, e.target.value, airdrop)}
                              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-1 sm:px-2 py-1 text-xs sm:text-sm w-28"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="ended">Ended</option>
                              <option
                                value="claim"
                                disabled={!airdrop.claimUrl}
                                title={airdrop.claimUrl ? 'Set status to Claim' : 'Requires a Claim URL - Edit the airdrop first'}
                              >
                                Claim {!airdrop.claimUrl && '(Requires Claim URL)'}
                              </option>
                            </select>

                            <button
                              onClick={() => {
                                setEditingAirdrop(airdrop);
                                setTimeout(() => {
                                  if (formRef.current) {
                                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-xs sm:text-sm px-2 py-1"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => {
                                setUpdatingAirdrop(airdrop);
                                setTimeout(() => {
                                  if (updateFormRef.current) {
                                    updateFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs sm:text-sm flex items-center px-2 py-1"
                            >
                              <FaBell className="mr-1" /> Update
                            </button>

                            <button
                              onClick={() => toggleExpandAirdrop(airdrop)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-xs sm:text-sm px-2 py-1"
                            >
                              {expandedAirdrop && expandedAirdrop._id === airdrop._id ? 'Hide Updates' : 'Show Updates'}
                            </button>

                            <button
                              onClick={() => handleDeleteAirdrop(airdrop._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs sm:text-sm px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded row for updates */}
                      {expandedAirdrop && expandedAirdrop._id === airdrop._id && (
                        <tr>
                          <td colSpan="5" className="px-2 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700">
                            {airdrop.updates && airdrop.updates.length > 0 ? (
                              <AirdropUpdates updates={airdrop.updates} />
                            ) : (
                              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                                No updates available for this airdrop.
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
