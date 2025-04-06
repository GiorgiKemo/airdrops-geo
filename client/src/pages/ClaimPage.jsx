import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTracking } from '../context/TrackingContext';
import AirdropClaimCard from '../components/AirdropClaimCard';
import { airdropService } from '../services/api';

const ClaimPage = () => {
  const { user } = useAuth();
  const { trackedAirdrops, loading: trackingLoading, refreshTracking } = useTracking();
  const [allEndedAirdrops, setAllEndedAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('tracked'); // 'tracked' or 'all'

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Fetch all ended airdrops
  useEffect(() => {
    const fetchEndedAirdrops = async () => {
      try {
        setLoading(true);
        const airdrops = await airdropService.getAirdrops();
        const endedAirdrops = airdrops.filter(airdrop => airdrop.status === 'ended');
        setAllEndedAirdrops(endedAirdrops);
        setError(null);
      } catch (err) {
        setError('Failed to fetch ended airdrops');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndedAirdrops();
  }, []);

  // Refresh tracking data when component mounts
  useEffect(() => {
    refreshTracking();
  }, [refreshTracking]);

  // Get airdrops based on filter
  const getFilteredAirdrops = () => {
    if (filter === 'tracked') {
      return trackedAirdrops.filter(airdrop => airdrop.status === 'ended');
    } else {
      return allEndedAirdrops;
    }
  };

  const filteredAirdrops = getFilteredAirdrops();
  const isLoading = loading || trackingLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Claim Your Rewards
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          These airdrops have ended and may be ready for claiming rewards. Check the official websites for claim instructions.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('tracked')}
            className={`px-4 py-2 rounded-md ${
              filter === 'tracked'
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            My Tracked Airdrops
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Ended Airdrops
          </button>
        </div>
      </div>

      {/* Airdrops grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredAirdrops.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            {filter === 'tracked'
              ? "You don't have any tracked airdrops that have ended."
              : "There are no ended airdrops at the moment."}
          </p>
          <Link
            to="/"
            className="inline-block bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Discover Airdrops
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4">
          {filteredAirdrops.map((airdrop) => (
            <AirdropClaimCard key={airdrop._id} airdrop={airdrop} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimPage;
