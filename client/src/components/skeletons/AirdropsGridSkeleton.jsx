import AirdropCardSkeleton from './AirdropCardSkeleton';

/**
 * Skeleton loader for the airdrops grid
 * Displays multiple airdrop card skeletons in a grid layout
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton cards to display (default: 6)
 */
const AirdropsGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading airdrops">
      <span className="sr-only">Loading airdrops...</span>
      {Array.from({ length: count }).map((_, index) => (
        <AirdropCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default AirdropsGridSkeleton;
