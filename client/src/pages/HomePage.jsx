import { useState, useEffect, useRef, useMemo } from 'react';
import { useDisplay } from '../context/DisplayContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { airdropService } from '../services/api';
import VirtualizedAirdropList from '../components/VirtualizedAirdropList';
import AirdropsGridSkeleton from '../components/skeletons/AirdropsGridSkeleton';
import PageFAQ from '../components/PageFAQ';
import SEO from '../components/SEO';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { faqData } from '../data/faqData';

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
        console.log('Fetching airdrops...');
        setLoading(true);
        const data = await airdropService.getAirdrops();
        console.log('Airdrops fetched successfully:', { count: data?.length || 0 });
        setAirdrops(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching airdrops:', err);
        setError('Failed to fetch airdrops. Please try again later.');
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
  // Use useMemo to optimize filtering and sorting
  const filteredAirdrops = useMemo(() => {
    // Safety check for empty or undefined airdrops
    if (!airdrops || !Array.isArray(airdrops) || airdrops.length === 0) {
      console.log('No airdrops available for filtering');
      return [];
    }

    console.log('Filtering airdrops:', { count: airdrops.length, filter });
    let result = [];

    // Step 1: Apply status filter
    if (filter === 'all') {
      // For 'all' filter, get all airdrops but sort active ones with most views first
      result = [...airdrops].sort((a, b) => {
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
      result = airdrops.filter(airdrop => airdrop.status === 'claim');
    } else if (filter === 'popular') {
      // For 'popular' filter, show all airdrops sorted by views (highest first)
      result = [...airdrops].sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (filter === 'recent') {
      // For 'recent' filter, show all airdrops sorted by creation date (newest first)
      result = [...airdrops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // For other filters (active, upcoming, ended), filter by status
      result = airdrops.filter(airdrop => airdrop.status === filter);
    }

    // Step 2: Apply additional sorting for upcoming airdrops
    if (filter === 'upcoming') {
      result = [...result].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    // Step 3: Apply search filter if search term exists
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(airdrop =>
        airdrop.title.toLowerCase().includes(lowerSearchTerm) ||
        airdrop.token.toLowerCase().includes(lowerSearchTerm) ||
        airdrop.description.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Step 4: Apply cost filter
    if (costFilter !== 'all') {
      result = result.filter(airdrop => {
        // If the airdrop has no costType field (for backward compatibility), assume it's free
        if (!airdrop.costType && costFilter === 'free') {
          return true;
        }

        // Match the exact costType
        return airdrop.costType === costFilter;
      });
    }

    // Step 5: For all filters except 'ended', rank ended airdrops at the bottom
    if (filter !== 'ended') {
      result = [...result].sort((a, b) => {
        // If a is ended and b is not, a should come after b
        if (a.status === 'ended' && b.status !== 'ended') return 1;
        // If b is ended and a is not, b should come after a
        if (b.status === 'ended' && a.status !== 'ended') return -1;
        // Otherwise maintain the current order
        return 0;
      });
    }

    return result;
  }, [airdrops, filter, searchTerm, costFilter]); // Dependencies for useMemo

  return (
    <>
      <SEO
        title="Crypto Airdrops 2025 | Find & Claim Free Tokens | Airdrops.geo"
        description="Discover the latest crypto airdrops in 2025. Find, track and claim free tokens from top blockchain projects. Daily updated list of active, upcoming, and popular cryptocurrency airdrops."
        canonicalUrl="/"
        keywords="crypto airdrops, free crypto, cryptocurrency airdrops, claim airdrops, best airdrops 2025, upcoming airdrops, active airdrops, free tokens, blockchain airdrops, airdrop tracker"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What are crypto airdrops?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Crypto airdrops are free distributions of cryptocurrency tokens or coins to wallet addresses. Projects use airdrops as a marketing strategy to create awareness, reward loyal users, or distribute tokens widely. They're essentially free cryptocurrency that you can claim by meeting certain criteria."
                }
              },
              {
                "@type": "Question",
                "name": "How do I claim crypto airdrops?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To claim crypto airdrops, you typically need to complete specific tasks like joining a Discord server, following social media accounts, or interacting with a protocol. Some airdrops require you to hold certain tokens, while others might need you to connect your wallet to a platform. Always check the airdrop's requirements and follow the instructions carefully."
                }
              },
              {
                "@type": "Question",
                "name": "Are crypto airdrops safe?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "While many crypto airdrops are legitimate, you should always exercise caution. Never share your private keys or seed phrases, and be wary of connecting your wallet to unknown platforms. At Airdrops.geo, we verify airdrops before listing them, but always do your own research before participating in any airdrop."
                }
              },
              {
                "@type": "Question",
                "name": "Why do projects give away free tokens?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Blockchain projects distribute free tokens through airdrops for several reasons: to create awareness about their project, build a community, reward early adopters, distribute governance rights, or ensure a wide distribution of tokens. It's a marketing strategy that helps projects gain users and visibility in the competitive crypto space."
                }
              },
              {
                "@type": "Question",
                "name": "How can I find the best crypto airdrops in 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Airdrops.geo is your best resource for finding legitimate and valuable crypto airdrops in 2025. We regularly update our platform with new opportunities, verify their authenticity, and provide all the information you need to participate. Create an account to track your favorite airdrops and get notified about new opportunities."
                }
              }
            ]
          })}
        </script>
      </SEO>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--macos-text)] mb-2 sm:mb-4 text-center sm:text-left tracking-tight">
          Latest Crypto Airdrops 2025 | Find & Claim Free Tokens
        </h1>
        <p className="text-[var(--macos-text-secondary)] mb-3 text-xs sm:text-sm md:text-base break-words text-center sm:text-left max-w-3xl">
          Welcome to Airdrops.geo, your ultimate resource for finding and claiming the best crypto airdrops. We track upcoming, active, and popular cryptocurrency airdrops daily, helping you earn free tokens from top blockchain projects. Start exploring now!
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
        <div className="py-4">
          <AirdropsGridSkeleton count={9} />
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
        <div className="flex flex-col h-auto" style={{ height: 'calc(100vh - 14rem)' }}>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-2">
            Filtered airdrops: {filteredAirdrops.length}
          </div>

          {/* Use the virtualized list component for better performance */}
          <VirtualizedAirdropList
            airdrops={filteredAirdrops}
            className="h-full"
          />

          {/* No pagination buttons needed with virtualization */}
        </div>
      )}

      {/* FAQ Section using the reusable component */}
      <div className="mt-12 mb-8 macos-card p-6">
        <PageFAQ
          questions={faqData.home}
          title="Frequently Asked Questions About Crypto Airdrops"
          showMoreLink={false}
          className="mt-0"
        />
      </div>
    </div>
    </>
  );
};

export default HomePage;
