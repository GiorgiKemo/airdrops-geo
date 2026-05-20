import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AirdropCard from './AirdropCard';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

/**
 * A virtualized list component for rendering airdrop cards efficiently
 * Only renders the cards that are visible in the viewport plus a buffer
 */
const VirtualizedAirdropList = ({ airdrops, className = '' }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [itemHeight, setItemHeight] = useState(240); // Default height estimate
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef(null);
  const bufferSize = 10; // Increased buffer size for smoother scrolling
  const overscan = 5; // Additional items to render for smoother scrolling
  const safeAirdrops = useMemo(() => (Array.isArray(airdrops) ? airdrops : []), [airdrops]);

  // Responsive number of cards per row based on screen size
  const [cardsPerRow, setCardsPerRow] = useState(getCardsPerRow());

  // Function to determine cards per row based on screen width
  function getCardsPerRow() {
    if (typeof window === 'undefined') return 3; // Default for SSR
    const width = window.innerWidth;
    if (width < 640) return 1;      // Mobile: 1 card per row
    if (width < 1024) return 2;     // Tablet: 2 cards per row
    return 3;                       // Desktop: 3 cards per row
  }

  // Calculate which rows should be visible based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    // Calculate visible rows with buffer and overscan
    const rowHeight = itemHeight;
    const visibleStartRow = Math.floor(scrollTop / rowHeight);
    const visibleEndRow = Math.ceil((scrollTop + viewportHeight) / rowHeight);

    // Add buffer and overscan for smoother scrolling
    const startRow = Math.max(0, visibleStartRow - bufferSize - (isScrolling ? overscan : 0));
    const endRow = Math.min(
      Math.ceil(safeAirdrops.length / cardsPerRow) - 1, // Total rows
      visibleEndRow + bufferSize + (isScrolling ? overscan : 0)
    );

    // Convert rows to item indices
    const startIndex = startRow * cardsPerRow;
    const endIndex = Math.min(safeAirdrops.length - 1, (endRow + 1) * cardsPerRow - 1);

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [safeAirdrops.length, itemHeight, bufferSize, overscan, isScrolling, cardsPerRow]);

  // Handle scroll events with debouncing for better performance
  const handleScroll = useCallback(() => {
    // Set scrolling state to true
    if (!isScrolling) {
      setIsScrolling(true);
    }

    // Clear previous timeout
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }

    // Set a timeout to mark scrolling as finished
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Use requestAnimationFrame for smoother updates
    window.requestAnimationFrame(calculateVisibleRange);
  }, [calculateVisibleRange, isScrolling]);

  // Measure container and item height on mount and when window resizes
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Try to measure the height of the first item if it exists
        const firstItem = containerRef.current.querySelector('.airdrop-card-item');
        if (entry.contentRect.height > 0 && firstItem) {
          setItemHeight(firstItem.offsetHeight);
        }
      }
      calculateVisibleRange();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [calculateVisibleRange]);

  // Add scroll event listener with passive option for better performance
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive event listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initial calculation
    calculateVisibleRange();

    return () => {
      // Clean up scroll event listener and timeout
      container.removeEventListener('scroll', handleScroll);
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, [handleScroll, calculateVisibleRange]);

  // Recalculate when airdrops change
  useIsomorphicLayoutEffect(() => {
    calculateVisibleRange();
  }, [airdrops, calculateVisibleRange]);

  // Handle window resize to update cards per row
  useEffect(() => {
    function handleResize() {
      const newCardsPerRow = getCardsPerRow();
      if (newCardsPerRow !== cardsPerRow) {
        setCardsPerRow(newCardsPerRow);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, [cardsPerRow]);

  // Calculate total rows based on cards per row and create placeholder height
  const totalRows = safeAirdrops.length > 0 ? Math.ceil(safeAirdrops.length / cardsPerRow) : 0;
  const totalHeight = Math.max(totalRows * itemHeight, 100); // Minimum height of 100px

  // Adjust visible range to ensure complete rows (multiples of 3)
  const adjustedVisibleRange = useMemo(() => {
    // Safety check for empty airdrops array
    if (safeAirdrops.length === 0) {
      return { start: 0, end: 0 };
    }

    // Round down start to nearest multiple of cardsPerRow
    const adjustedStart = Math.floor(visibleRange.start / cardsPerRow) * cardsPerRow;
    // Round up end to nearest multiple of cardsPerRow
    const adjustedEnd = Math.ceil((visibleRange.end + 1) / cardsPerRow) * cardsPerRow - 1;

    return {
      start: Math.min(Math.max(0, adjustedStart), safeAirdrops.length - 1),
      end: Math.min(adjustedEnd, safeAirdrops.length - 1)
    };
  }, [visibleRange.start, visibleRange.end, safeAirdrops.length, cardsPerRow]);

  // Get the subset of airdrops to render - memoize to prevent unnecessary re-renders
  const visibleAirdrops = useMemo(() => {
    // Safety check for empty airdrops array
    if (safeAirdrops.length === 0) {
      return [];
    }

    // Ensure valid range
    const start = Math.min(adjustedVisibleRange.start, safeAirdrops.length - 1);
    const end = Math.min(adjustedVisibleRange.end, safeAirdrops.length - 1);

    // Only slice if we have a valid range
    if (start <= end && start >= 0) {
      return safeAirdrops.slice(start, end + 1);
    }

    return [];
  }, [safeAirdrops, adjustedVisibleRange.start, adjustedVisibleRange.end]);

  // Calculate the offset for the visible items based on rows
  const startRow = Math.floor(adjustedVisibleRange.start / cardsPerRow);
  const offsetY = startRow * itemHeight;

  // Memoize the grid style for better performance
  const gridStyle = useMemo(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(${offsetY}px)`,
    willChange: 'transform', // Hint to the browser to optimize transforms
  }), [offsetY]);

  // Memoize the container style
  const containerStyle = useMemo(() => ({
    height: '100%',
    position: 'relative',
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  }), []);

  // Memoize the spacer style
  const spacerStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative',
  }), [totalHeight]);

  // Check if we have any airdrops to display
  const hasAirdrops = safeAirdrops.length > 0;

  // Log for debugging
  console.log('VirtualizedAirdropList rendering:', {
    airdropsCount: safeAirdrops.length,
    visibleRange,
    adjustedVisibleRange,
    visibleAirdropsCount: visibleAirdrops.length,
    totalRows,
    totalHeight
  });

  return (
    <div
      ref={containerRef}
      className={`scrollable-hidden overflow-y-auto custom-scrollbar ${className} ${isScrolling ? 'is-scrolling' : ''}`}
      style={containerStyle}
    >
      {hasAirdrops ? (
        // Spacer div to maintain scroll height
        <div style={spacerStyle}>
          {/* Visible items container */}
          <div style={gridStyle}>
            <div className="grid gap-2 sm:gap-3 md:gap-4" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cardsPerRow}, 1fr)`
            }}>
              {visibleAirdrops.map((airdrop, index) => (
                <div
                  key={airdrop._id || `airdrop-${adjustedVisibleRange.start + index}`}
                  className="transform-gpu p-1 h-[14rem] sm:h-[13rem] md:h-[14rem] lg:h-[15rem] airdrop-card-item will-change-transform"
                  style={{ contain: 'layout paint size' }} // CSS containment for better performance
                >
                  <AirdropCard airdrop={airdrop} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Fallback when no airdrops are available
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading airdrops...</p>
        </div>
      )}
    </div>
  );
};

export default VirtualizedAirdropList;
