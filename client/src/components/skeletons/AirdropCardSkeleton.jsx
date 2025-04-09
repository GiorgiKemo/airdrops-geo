/**
 * Skeleton loader for airdrop cards
 * Displays a loading placeholder while airdrop data is being fetched
 */
const AirdropCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full animate-pulse">
      {/* Image placeholder */}
      <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
      
      {/* Content area */}
      <div className="p-4">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        
        {/* Description placeholder */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        
        {/* Status badge placeholder */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-4"></div>
        
        {/* Date placeholder */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        
        {/* Social links placeholder */}
        <div className="flex space-x-2 mb-4">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Button placeholder */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export default AirdropCardSkeleton;
