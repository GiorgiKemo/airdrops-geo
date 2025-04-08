import { useState, useEffect, useRef } from 'react';
import { useDisplay } from '../context/DisplayContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { airdropService } from '../services/api';
import AirdropCard from '../components/AirdropCard';
import SEO from '../components/SEO';
import { FaSearch, FaFilter } from 'react-icons/fa';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [costFilter, setCostFilter] = useState('all');
  const [showCostFilter, setShowCostFilter] = useState(false);
  const costFilterRef = useRef(null);

  // Get filter from URL or default to 'all'
  const queryParams = new URLSearchParams(location.search);
  const [filter, setFilter] = useState(queryParams.get('filter') || 'all');
  const { displayCount, setDisplayCount, initialDisplayCount } = useDisplay();
  const cardContainerRef = useRef(null);
  const newCardsRef = useRef(null);


  // Helper function to update filter and URL
  const updateFilter = (newFilter) => {
    setFilter(newFilter);
    // Reset display count when changing filters
    setDisplayCount(initialDisplayCount);
    const params = new URLSearchParams(location.search);
    params.set('filter', newFilter);
    navigate(`?${params.toString()}`, { replace: true });
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

  // Close cost filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (costFilterRef.current && !costFilterRef.current.contains(event.target)) {
        setShowCostFilter(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle responsive layout adjustments
  useEffect(() => {
    function handleResize() {
      // Adjust container height based on viewport height
      if (cardContainerRef.current) {
        const viewportHeight = window.innerHeight;
        const navbarHeight = 64; // Approximate navbar height
        const filtersHeight = 120; // Approximate filters section height
        const buttonsHeight = 80; // Approximate buttons section height
        const padding = 40; // Additional padding

        const containerHeight = viewportHeight - (navbarHeight + filtersHeight + buttonsHeight + padding);
        cardContainerRef.current.style.height = `${Math.max(300, containerHeight)}px`;
      }
    }

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filter airdrops based on status, search term, and cost filter
  let filteredAirdrops = [];

  if (filter === 'all') {
    // For 'all' filter, get all airdrops but sort active ones with most views first
    filteredAirdrops = [...airdrops].sort((a, b) => {
      // First prioritize active status
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;

      // If both are active or both are not active, sort by views
      if (a.status === 'active' && b.status === 'active') {
        return (b.views || 0) - (a.views || 0); // Sort by views (highest first)
      }

      // For non-active airdrops, maintain default order
      return 0;
    });
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

  // Apply search filter if search term exists
  if (searchTerm.trim() !== '') {
    filteredAirdrops = filteredAirdrops.filter(airdrop =>
      airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply cost filter
  if (costFilter !== 'all') {
    filteredAirdrops = filteredAirdrops.filter(airdrop => {
      // If the airdrop has no costType field (for backward compatibility), assume it's free
      if (!airdrop.costType && costFilter === 'free') {
        return true;
      }

      // Match the exact costType
      return airdrop.costType === costFilter;
    });
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
    <>
      <SEO
        title="Airdrops.geo - Discover and Claim Free Cryptocurrency Airdrops"
        description="Find the latest cryptocurrency airdrops, track your favorite projects, and claim free tokens. Stay updated with upcoming, active, and popular crypto airdrops."
        canonicalUrl="/"
      />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--macos-text)] mb-2 sm:mb-4 text-center sm:text-left tracking-tight">
          Cryptocurrency Airdrops
        </h1>
        <p className="text-[var(--macos-text-secondary)] mb-3 text-xs sm:text-sm md:text-base break-words text-center sm:text-left max-w-3xl">
          Discover the latest cryptocurrency airdrops. Claim free tokens and participate in exciting crypto projects.
        </p>

      </div>

      {/* Filter buttons and search */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
          <button
            onClick={() => updateFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => updateFilter('active')}
            className={`px-4 py-2 rounded-md ${
              filter === 'active'
                ? 'bg-green-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => updateFilter('popular')}
            className={`px-4 py-2 rounded-md ${
              filter === 'popular'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => updateFilter('recent')}
            className={`px-4 py-2 rounded-md ${
              filter === 'recent'
                ? 'bg-teal-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => updateFilter('upcoming')}
            className={`px-4 py-2 rounded-md ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => updateFilter('ended')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ended'
                ? 'bg-gray-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Ended
          </button>
          <button
            onClick={() => updateFilter('claim')}
            className={`px-4 py-2 rounded-md ${
              filter === 'claim'
                ? 'bg-red-600 text-white font-medium'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Claim
          </button>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto mt-3 sm:mt-0">
            {/* Search input */}
            <div className="relative">
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

            {/* Cost filter dropdown */}
            <div className="relative" ref={costFilterRef}>
              <button
                onClick={() => setShowCostFilter(!showCostFilter)}
                className="macos-input flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--macos-primary)]"
              >
                <FaFilter className="text-[var(--macos-text-secondary)]" />
                <span>
                  {costFilter === 'free' ? 'Free' :
                   costFilter === 'paid' ? '$ Required' : 'All'}
                </span>
              </button>

              {showCostFilter && (
                <div className="macos-card absolute right-0 mt-1 w-40 z-10">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => {
                          setCostFilter('all');
                          setShowCostFilter(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${costFilter === 'all' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--macos-text)]'}`}
                      >
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setCostFilter('free');
                          setShowCostFilter(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${costFilter === 'free' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--macos-text)]'}`}
                      >
                        Free
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setCostFilter('paid');
                          setShowCostFilter(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${costFilter === 'paid' ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--macos-text)]'}`}
                      >
                        $ Required
                      </button>
                    </li>

                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No airdrops found.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-auto max-h-[calc(100vh-14rem)]">
          <div ref={cardContainerRef} className="scrollable-hidden px-0 py-1 overflow-y-auto custom-scrollbar h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {filteredAirdrops.slice(0, displayCount).map((airdrop, index) => (
                <div key={airdrop._id} className="transform-gpu p-1 h-[12rem] sm:h-[13rem] md:h-[14rem] lg:h-[15rem] airdrop-card" ref={index === displayCount - 6 ? newCardsRef : null}>
                  <AirdropCard airdrop={airdrop} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center py-4 gap-4 flex-wrap text-center w-full overflow-visible">
            {displayCount > initialDisplayCount && (
              <button
                onClick={() => {
                  // First scroll the whole page to the top with macOS-like smooth scrolling
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });

                  // Also scroll the card container to the top with macOS-like smooth scrolling
                  if (cardContainerRef.current) {
                    cardContainerRef.current.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }

                  // Then reset the display count after a small delay
                  // This ensures the scroll happens before the cards disappear
                  setTimeout(() => {
                    setDisplayCount(initialDisplayCount);
                  }, 300);
                }}
                className="macos-button bg-[var(--macos-secondary)] text-xs sm:text-sm py-2 px-6 sm:py-2.5 sm:px-8 w-auto min-w-[120px] font-bold whitespace-nowrap overflow-visible"
              >
                View Less ↑
              </button>
            )}
            {filteredAirdrops.length > displayCount && (
              <button
                onClick={() => {
                  // First increase the display count
                  setDisplayCount(displayCount + 6);

                  // Then scroll to show the new cards
                  setTimeout(() => {
                    // Find the last card of the previous set
                    const lastPreviousCard = document.querySelector(`.airdrop-card:nth-child(${displayCount})`);

                    if (lastPreviousCard && cardContainerRef.current) {
                      // Get the position of the last previous card
                      const containerRect = cardContainerRef.current.getBoundingClientRect();
                      const cardRect = lastPreviousCard.getBoundingClientRect();
                      const scrollTop = cardRect.top - containerRect.top + cardContainerRef.current.scrollTop;

                      // Scroll to position the last previous card at the top
                      cardContainerRef.current.scrollTo({
                        top: scrollTop,
                        behavior: 'smooth'
                      });
                    }
                  }, 50);
                }}
                className="macos-button text-xs sm:text-sm py-2 px-6 sm:py-2.5 sm:px-8 w-auto min-w-[120px] font-bold whitespace-nowrap overflow-visible"
              >
                View More ↓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default HomePage;
