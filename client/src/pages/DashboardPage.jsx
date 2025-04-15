import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTracking } from '../context/TrackingContext';
import AirdropCard from '../components/AirdropCard';
import PageFAQ from '../components/PageFAQ';
import { faqData } from '../data/faqData';
import { FaSearch } from 'react-icons/fa';

const DashboardPage = () => {
  const { user } = useAuth();
  const { trackedAirdrops, loading, error, refreshTracking } = useTracking();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Refresh tracking data when component mounts
  useEffect(() => {
    refreshTracking();
  }, []);

  // Filter airdrops based on status and search term
  let filteredAirdrops = filter === 'all'
    ? [...trackedAirdrops]
    : trackedAirdrops.filter(airdrop => airdrop.status === filter);

  // Apply search filter if search term exists
  if (searchTerm.trim() !== '') {
    filteredAirdrops = filteredAirdrops.filter(airdrop =>
      airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
          My Tracked Airdrops
        </h1>
        <p className="text-[var(--macos-text-secondary)] mb-3 text-xs sm:text-sm md:text-base break-words text-center sm:text-left max-w-3xl">
          Track and manage airdrops you're participating in. Keep up with deadlines and requirements.
        </p>
      </div>

      {/* Filter buttons and search */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2 mb-3">
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md ${
              filter === 'active'
                ? 'bg-green-600 dark:bg-green-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md ${
              filter === 'upcoming'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ended'
                ? 'bg-gray-600 dark:bg-gray-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Ended
          </button>
          <button
            onClick={() => setFilter('claim')}
            className={`px-4 py-2 rounded-md ${
              filter === 'claim'
                ? 'bg-red-600 dark:bg-red-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Claim
          </button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-auto mt-3 sm:mt-0">
            <div className="flex items-center macos-input py-1 px-2">
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
      </div>

      {/* Airdrops grid */}
      {loading ? (
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
            {filter === 'all'
              ? "You're not tracking any airdrops yet."
              : `No ${filter} airdrops in your tracking list.`}
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium text-sm sm:text-base py-2 px-4 sm:px-6 rounded-md transition-colors shadow-md"
          >
            Discover Airdrops
          </Link>
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

      {/* FAQ Section */}
      <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <PageFAQ
          questions={faqData.dashboard}
          title="Frequently Asked Questions About My Airdrops"
          showMoreLink={true}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
