import { Link } from 'react-router-dom';
import AirdropLogo from './AirdropLogo';

const AirdropClaimCard = ({ airdrop }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status class for the badge
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
      case 'ended':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Link
      to={`/airdrops/${airdrop._id}`}
      className="block border dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] relative"
    >
      {/* Claim banner */}
      <div className="absolute top-0 right-0 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
        CLAIM NOW
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          {/* Logo */}
          <div className="mr-3">
            <AirdropLogo airdrop={airdrop} size="medium" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{airdrop.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                  airdrop.status
                )}`}
              >
                {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {airdrop.description}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Token:</span> {airdrop.token}
          </div>
          <div>
            <span className="font-medium">Ended:</span> {formatDate(airdrop.deadline)}
          </div>
        </div>

        {/* Claim button */}
        <div className="mt-4">
          <a
            href={airdrop.claimUrl || airdrop.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full block text-center py-2 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium rounded-md transition-colors"
          >
            Go to Claim Site
          </a>
        </div>
      </div>
    </Link>
  );
};

export default AirdropClaimCard;
