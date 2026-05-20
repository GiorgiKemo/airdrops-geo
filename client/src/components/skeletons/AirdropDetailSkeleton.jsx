/**
 * Skeleton loader for airdrop details
 * Displays a loading placeholder while airdrop detail data is being fetched
 */
const AirdropDetailSkeleton = () => {
  return (
    <div className="motion-safe:animate-pulse" role="status" aria-label="Loading airdrop details">
      <span className="sr-only">Loading airdrop details...</span>
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8" aria-hidden="true">
        {/* Image placeholder */}
        <div className="w-full md:w-1/3 h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        
        {/* Content placeholder */}
        <div className="w-full md:w-2/3">
          {/* Title placeholder */}
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
          
          {/* Description placeholder */}
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-4"></div>
          
          {/* Status and date placeholders */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
          </div>
          
          {/* Social links placeholder */}
          <div className="flex space-x-3 mb-6">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          
          {/* Button placeholder */}
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-full md:w-1/2"></div>
        </div>
      </div>
      
      {/* Tabs placeholder */}
      <div className="border-b border-[var(--macos-divider)] mb-6" aria-hidden="true">
        <div className="flex space-x-8">
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      
      {/* Tab content placeholder */}
      <div className="space-y-4" aria-hidden="true">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
        
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4 mt-8"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
};

export default AirdropDetailSkeleton;
