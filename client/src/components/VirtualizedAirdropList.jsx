import { useState, useEffect, useRef, useCallback } from 'react';
import AirdropCard from './AirdropCard';

/**
 * A virtualized list component for rendering airdrop cards efficiently
 * Only renders the cards that are visible in the viewport plus a buffer
 */
const VirtualizedAirdropList = ({ airdrops, className = '' }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemHeight, setItemHeight] = useState(240); // Default height estimate
  const bufferSize = 5; // Number of items to render above and below the visible area
  
  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    
    // Calculate visible range with buffer
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      airdrops.length - 1,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize
    );
    
    setVisibleRange({ start: startIndex, end: endIndex });
  }, [airdrops.length, itemHeight, bufferSize]);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    window.requestAnimationFrame(calculateVisibleRange);
  }, [calculateVisibleRange]);
  
  // Measure container and item height on mount and when window resizes
  useEffect(() => {
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
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    calculateVisibleRange();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, calculateVisibleRange]);
  
  // Recalculate when airdrops change
  useEffect(() => {
    calculateVisibleRange();
  }, [airdrops, calculateVisibleRange]);
  
  // Create placeholder items for the full list height
  const totalHeight = airdrops.length * itemHeight;
  
  // Get the subset of airdrops to render
  const visibleAirdrops = airdrops.slice(visibleRange.start, visibleRange.end + 1);
  
  // Calculate the offset for the visible items
  const offsetY = visibleRange.start * itemHeight;
  
  return (
    <div 
      ref={containerRef}
      className={`scrollable-hidden overflow-y-auto custom-scrollbar ${className}`}
      style={{ height: '100%', position: 'relative' }}
    >
      {/* Spacer div to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            transform: `translateY(${offsetY}px)` 
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {visibleAirdrops.map((airdrop) => (
              <div 
                key={airdrop._id} 
                className="transform-gpu p-1 h-[12rem] sm:h-[13rem] md:h-[14rem] lg:h-[15rem] airdrop-card-item"
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
