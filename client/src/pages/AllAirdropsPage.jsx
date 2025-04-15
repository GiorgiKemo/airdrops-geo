import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { airdropService } from '../services/api';
import AirdropCard from '../components/AirdropCard';
import AirdropsGridSkeleton from '../components/skeletons/AirdropsGridSkeleton';

const AllAirdropsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get filter from URL or default to 'all'
  const queryParams = new URLSearchParams(location.search);
  const [filter, setFilter] = useState(queryParams.get('filter') || 'all');

  // Helper function to update filter and URL
  const updateFilter = (newFilter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(location.search);
    params.set('filter', newFilter);
    navigate(`/all?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
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

    fetchAirdrops();
  }, []); // Only fetch on component mount

  // Filter airdrops based on status
  let filteredAirdrops = [];

  if (filter === 'all') {
    // For 'all' filter, get all airdrops but we'll sort them later
    filteredAirdrops = [...airdrops];
  } else if (filter === 'claim') {
    // For 'claim' filter, show airdrops with 'claim' status
    filteredAirdrops = airdrops.filter(airdrop => airdrop.status === 'claim');
  } else if (filter === 'popular') {
    // For 'popular' filter, show all airdrops sorted by views (highest first)
    filteredAirdrops = [...airdrops].sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (filter === 'recent') {
    // For 'recent' filter, show all airdrops sorted by creation date (newest first)
    filteredAirdrops = [...airdrops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // For other filters (active, upcoming, ended), filter by status
    filteredAirdrops = airdrops.filter(airdrop => airdrop.status === filter);
  }

  // If we're filtering for upcoming airdrops, sort them by start date (soonest first)
  if (filter === 'upcoming') {
    filteredAirdrops = [...filteredAirdrops].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }

  // For all filters except 'ended', rank ended airdrops at the bottom
  if (filter !== 'ended') {
    filteredAirdrops = [...filteredAirdrops].sort((a, b) => {
      // If a is ended and b is not, a should come after b
      if (a.status === 'ended' && b.status !== 'ended') return 1;
      // If b is ended and a is not, b should come after a
      if (b.status === 'ended' && a.status !== 'ended') return -1;
      // Otherwise maintain the current order
      return 0;
    });
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--macos-text)] mb-2 sm:mb-4 text-center sm:text-left tracking-tight">
          All Airdrops
        </h1>
        <p className="text-[var(--macos-text-secondary)] mb-3 text-xs sm:text-sm md:text-base break-words text-center sm:text-left max-w-3xl">
          Browse all available airdrops in one place.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--macos-text)] mb-3 text-center sm:text-left">Filter Airdrops</h2>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <button
            onClick={() => updateFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => updateFilter('active')}
            className={`px-4 py-2 rounded-md ${
              filter === 'active'
                ? 'bg-green-600 dark:bg-green-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => updateFilter('popular')}
            className={`px-4 py-2 rounded-md ${
              filter === 'popular'
                ? 'bg-purple-600 dark:bg-purple-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => updateFilter('recent')}
            className={`px-4 py-2 rounded-md ${
              filter === 'recent'
                ? 'bg-teal-600 dark:bg-teal-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => updateFilter('upcoming')}
            className={`px-4 py-2 rounded-md ${
              filter === 'upcoming'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => updateFilter('ended')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ended'
                ? 'bg-gray-600 dark:bg-gray-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Ended
          </button>
          <button
            onClick={() => updateFilter('claim')}
            className={`px-4 py-2 rounded-md ${
              filter === 'claim'
                ? 'bg-red-600 dark:bg-red-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Claim
          </button>
        </div>
      </div>

      {/* Airdrops grid */}
      {loading ? (
        <div className="py-4">
          <AirdropsGridSkeleton count={12} />
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredAirdrops.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No airdrops found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 pb-4">
          {filteredAirdrops.map((airdrop) => (
            <div key={airdrop._id} className="transform-gpu p-1 h-[12rem] sm:h-[13rem] md:h-[14rem] lg:h-[15rem]">
              <AirdropCard airdrop={airdrop} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 sm:mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium rounded-md text-sm sm:text-base transition-colors shadow-md"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default AllAirdropsPage;
