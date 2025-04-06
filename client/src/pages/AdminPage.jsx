import { useState, useEffect, useRef } from 'react';
import { airdropService } from '../services/api';
import AirdropForm from '../components/AirdropForm';
import { FaSearch } from 'react-icons/fa';

const AdminPage = () => {
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAirdrop, setEditingAirdrop] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef(null);

  // Fetch all airdrops
  const fetchAirdrops = async () => {
    try {
      setLoading(true);
      const data = await airdropService.getAirdrops();
      setAirdrops(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch airdrops. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirdrops();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle create airdrop
  const handleCreateAirdrop = async (formData) => {
    try {
      await airdropService.createAirdrop(formData);
      setSuccessMessage('Airdrop created successfully!');
      setIsAdding(false);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to create airdrop. Please try again.');
      console.error(err);
    }
  };

  // Handle update airdrop
  const handleUpdateAirdrop = async (formData) => {
    try {
      await airdropService.updateAirdrop(editingAirdrop._id, formData);
      setSuccessMessage('Airdrop updated successfully!');
      setEditingAirdrop(null);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update airdrop. Please try again.');
      console.error(err);
    }
  };

  // Handle delete airdrop
  const handleDeleteAirdrop = async (id) => {
    if (window.confirm('Are you sure you want to delete this airdrop?')) {
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
  const handleStatusChange = async (id, newStatus) => {
    try {
      await airdropService.updateAirdrop(id, { status: newStatus });
      setSuccessMessage(`Airdrop status updated to ${newStatus}!`);
      fetchAirdrops();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update airdrop status. Please try again.');
      console.error(err);
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
            className="mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 block w-full sm:w-auto text-center sm:text-left"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add Airdrop Button */}
      {!isAdding && !editingAirdrop && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded block mx-auto sm:mx-0 w-full sm:w-auto"
        >
          Add New Airdrop
        </button>
      )}

      {/* Airdrops List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-0 text-center sm:text-left">Manage Airdrops</h2>

          {/* Search input */}
          <div className="relative w-full sm:w-auto mx-auto sm:mx-0">
            <div className="flex items-center macos-input py-1 px-2 w-full sm:w-64">
              <FaSearch className="text-[var(--macos-text-secondary)] mr-2" />
              <input
                type="text"
                placeholder="Search airdrops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-[var(--macos-text)]"
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
                    Deadline
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                  .map((airdrop) => (
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
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(airdrop.deadline)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium">
                      {/* Status dropdown */}
                      <select
                        value={airdrop.status}
                        onChange={(e) => handleStatusChange(airdrop._id, e.target.value)}
                        className="mr-2 sm:mr-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md px-1 sm:px-2 py-1 text-xs sm:text-sm"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                        <option value="claim">Claim</option>
                      </select>

                      <button
                        onClick={() => {
                          setEditingAirdrop(airdrop);
                          // Scroll to the form after a short delay to ensure it's rendered
                          setTimeout(() => {
                            if (formRef.current) {
                              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-2 sm:mr-4 text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAirdrop(airdrop._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
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
