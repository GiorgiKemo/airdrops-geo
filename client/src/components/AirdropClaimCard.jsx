import { useNavigate } from 'react-router-dom';
import AirdropLogo from './AirdropLogo';

const getText = (value, fallback = 'Not available') => (
  typeof value === 'string' && value.trim() ? value.trim() : fallback
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (!dateString || Number.isNaN(date.getTime())) {
    return 'TBA';
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const safeExternalUrl = (value) => {
  const rawUrl = getText(value, '');

  if (!rawUrl) {
    return '';
  }

  try {
    const candidateUrl = /^[a-z][a-z\d+.-]*:/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const parsedUrl = new URL(candidateUrl);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.href
      : '';
  } catch {
    return '';
  }
};

const getStatusLabel = (status) => {
  const safeStatus = getText(status, 'unknown').toLowerCase();
  return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
};

const AirdropClaimCard = ({ airdrop }) => {
  const navigate = useNavigate();
  const airdropId = getText(airdrop?._id, '');
  const title = getText(airdrop?.title, 'Untitled airdrop');
  const token = getText(airdrop?.token, 'TBA');
  const description = getText(airdrop?.description, 'No description available.');
  const status = getText(airdrop?.status, 'unknown').toLowerCase();
  const claimUrl = safeExternalUrl(airdrop?.claimUrl) || safeExternalUrl(airdrop?.link);
  const endDate = airdrop?.deadline || airdrop?.updatedAt || airdrop?.startDate;

  // Get status class for the badge
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
      case 'ended':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
      case 'claim':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const openDetails = () => {
    if (airdropId) {
      navigate(`/airdrops/${airdropId}`);
    }
  };

  const handleKeyDown = (event) => {
    if (airdropId && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <article
      className={`block border dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:-translate-y-2 hover:scale-[1.02] relative ${airdropId ? 'cursor-pointer' : 'cursor-default'}`}
      role={airdropId ? 'link' : undefined}
      tabIndex={airdropId ? 0 : undefined}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${title}`}
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                  status
                )}`}
              >
                {getStatusLabel(status)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Token:</span> {token}
          </div>
          <div>
            <span className="font-medium">Ended:</span> {formatDate(endDate)}
          </div>
        </div>

        {/* Claim button */}
        <div className="mt-4">
          {claimUrl ? (
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full block text-center py-2 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium rounded-md transition-colors"
            >
              Go to Claim Site
            </a>
          ) : (
            <span className="w-full block text-center py-2 px-4 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md">
              Claim link unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default AirdropClaimCard;
