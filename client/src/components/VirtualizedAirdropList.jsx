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
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemHeight, setItemHeight] = useState(240); // Default height estimate
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef(null);
  const bufferSize = 10; // Increased buffer size for smoother scrolling
  const overscan = 5; // Additional items to render for smoother scrolling

  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;

    // Calculate visible range with buffer and overscan
    const visibleStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleEndIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight);

    // Add buffer and overscan for smoother scrolling
    const startIndex = Math.max(0, visibleStartIndex - bufferSize - (isScrolling ? overscan : 0));
    const endIndex = Math.min(
      airdrops.length - 1,
      visibleEndIndex + bufferSize + (isScrolling ? overscan : 0)
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [airdrops.length, itemHeight, bufferSize, overscan, isScrolling]);

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
        setContainerHeight(entry.contentRect.height);

        // Try to measure the height of the first item if it exists
        const firstItem = containerRef.current.querySelector('.airdrop-card-item');
        if (firstItem) {
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  // Create placeholder items for the full list height
  const totalHeight = airdrops.length * itemHeight;

  // Get the subset of airdrops to render - memoize to prevent unnecessary re-renders
  const visibleAirdrops = useMemo(() => {
    return airdrops.slice(visibleRange.start, visibleRange.end + 1);
  }, [airdrops, visibleRange.start, visibleRange.end]);

  // Calculate the offset for the visible items
  const offsetY = visibleRange.start * itemHeight;

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

  return (
    <div
      ref={containerRef}
      className={`scrollable-hidden overflow-y-auto custom-scrollbar ${className} ${isScrolling ? 'is-scrolling' : ''}`}
      style={containerStyle}
    >
      {/* Spacer div to maintain scroll height */}
      <div style={spacerStyle}>
        {/* Visible items container */}
        <div style={gridStyle}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {visibleAirdrops.map((airdrop) => (
              <div
                key={airdrop._id}
                className="transform-gpu p-1 h-[12rem] sm:h-[13rem] md:h-[14rem] lg:h-[15rem] airdrop-card-item will-change-transform"
                style={{ contain: 'layout paint size' }} // CSS containment for better performance
              >
                <AirdropCard airdrop={airdrop} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedAirdropList;
