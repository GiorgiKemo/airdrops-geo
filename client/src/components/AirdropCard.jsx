import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import AirdropLogo from './AirdropLogo';
import { FaGlobe, FaDiscord, FaTelegram, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

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

const AirdropCard = ({ airdrop }) => {
  const navigate = useNavigate();
  const airdropId = getText(airdrop?._id, '');
  const title = getText(airdrop?.title, 'Untitled airdrop');
  const token = getText(airdrop?.token, 'TBA');
  const description = getText(airdrop?.description, 'No description available.');
  const status = getText(airdrop?.status, 'unknown').toLowerCase();
  const views = Number.isFinite(Number(airdrop?.views)) ? Number(airdrop.views) : 0;
  const domId = airdropId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const socialLinks = airdrop?.socialLinks && typeof airdrop.socialLinks === 'object'
    ? {
        website: safeExternalUrl(airdrop.socialLinks.website),
        discord: safeExternalUrl(airdrop.socialLinks.discord),
        twitter: safeExternalUrl(airdrop.socialLinks.twitter),
        telegram: safeExternalUrl(airdrop.socialLinks.telegram),
        github: safeExternalUrl(airdrop.socialLinks.github),
        instagram: safeExternalUrl(airdrop.socialLinks.instagram)
      }
    : {};
  const hasSocialLinks = Object.values(socialLinks).some(Boolean);
  const claimUrl = safeExternalUrl(airdrop?.claimUrl) || safeExternalUrl(airdrop?.link);

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white font-bold';
      case 'upcoming':
        return 'bg-blue-600 text-white font-bold';
      case 'ended':
        return 'bg-gray-600 text-white font-bold';
      case 'claim':
        return 'bg-red-600 text-white font-bold';
      default:
        return 'bg-gray-600 text-white font-bold';
    }
  };

  // Get card color based on airdrop settings
  const getCardColor = () => {
    // If custom color is provided, use it
    if (typeof airdrop?.cardColor === 'string' && airdrop.cardColor.trim() !== '') {
      return airdrop.cardColor;
    }

    // Otherwise, use predefined color
    if (typeof airdrop?.predefinedColor === 'string' && airdrop.predefinedColor !== 'default') {
      const colorMap = {
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        purple: '#8b5cf6',
        yellow: '#f59e0b',
        pink: '#ec4899',
        indigo: '#6366f1',
        gray: '#6b7280'
      };
      return colorMap[airdrop.predefinedColor] || null;
    }

    // Default: return null to use default styling
    return null;
  };

  const cardColor = getCardColor();
  const cardStyle = cardColor ? {
    backgroundColor: cardColor,
    borderColor: 'rgba(0,0,0,0.1)',
    color: '#ffffff' // White text for visibility
  } : {};

  const handleCardClick = () => {
    if (airdropId) {
      navigate(`/airdrops/${airdropId}`);
    }
  };

  const handleCardKeyDown = (event) => {
    if (airdropId && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      navigate(`/airdrops/${airdropId}`);
    }
  };

  return (
    <div className="group h-full w-full will-change-transform" role="article" aria-labelledby={`airdrop-title-${domId}`}>
      <div
        className={`macos-card relative block overflow-hidden h-full w-full z-10 flex flex-col backdrop-blur-md transform-gpu ${airdropId ? 'cursor-pointer' : 'cursor-default'}`}
        style={{...cardStyle, height: '100%', minHeight: '100%', contain: 'content'}}
        role={airdropId ? 'link' : undefined}
        tabIndex={airdropId ? 0 : undefined}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        aria-describedby={`airdrop-desc-${domId}`}
      >
        {status === 'claim' && (
          <div className="absolute top-0 right-0 z-10 bg-[var(--macos-danger)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
            CLAIM NOW
          </div>
        )}
      <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between text-left overflow-hidden">
        <div className="flex justify-between items-start mb-1">
          {/* Logo with track button overlay */}
          <div className="mr-2 sm:mr-3">
            <AirdropLogo airdrop={airdrop} size="medium" />
          </div>

          <div className="flex-1 min-w-0"> {/* min-width: 0 prevents flex child from overflowing */}
            <div className="flex flex-wrap justify-between items-start gap-1">
              <h3 id={`airdrop-title-${domId}`} className="text-base sm:text-lg md:text-xl font-bold text-[var(--macos-text)] truncate w-full sm:w-auto">{title}</h3>
              {status !== 'claim' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mb-1 text-xs sm:text-sm truncate font-medium">Token: {token}</p>
        <p id={`airdrop-desc-${domId}`} className="mb-2 line-clamp-2 sm:line-clamp-2 text-xs sm:text-sm break-words overflow-hidden">{description}</p>
        <div className="flex justify-between items-center mt-auto flex-wrap gap-2">
          <div className="flex flex-col items-start">
            <p className="text-xs sm:text-sm">
              Start: {formatDate(airdrop?.startDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Social Media Links */}
            {hasSocialLinks && (
              <div className="flex gap-1 sm:gap-2">
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Website"
                  >
                    <FaGlobe className="text-xs sm:text-sm" />
                  </a>
                )}
                {socialLinks.discord && (
                  <a
                    href={socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#5865F2] dark:hover:text-[#7289DA] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Discord"
                  >
                    <FaDiscord className="text-xs sm:text-sm" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="X (Twitter)"
                  >
                    <FaXTwitter className="text-xs sm:text-sm" />
                  </a>
                )}
                {socialLinks.telegram && (
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0088cc] dark:hover:text-[#29a9eb] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Telegram"
                  >
                    <FaTelegram className="text-xs sm:text-sm" />
                  </a>
                )}
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#333] dark:hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="GitHub"
                  >
                    <FaGithub className="text-xs sm:text-sm" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#E1306C] dark:hover:text-[#F56040] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Instagram"
                  >
                    <FaInstagram className="text-xs sm:text-sm" />
                  </a>
                )}
              </div>
            )}
            <span className="font-medium text-xs sm:text-sm">
              {views} views
            </span>
          </div>
        </div>

        {/* Claim button - shown when status is claim */}
        {status === 'claim' && (
          <div className="mt-1">
            {claimUrl ? (
              <a
                href={claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="macos-button block w-full text-center bg-[var(--macos-danger)] text-white font-bold text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                onClick={(e) => e.stopPropagation()}
              >
                CLAIM REWARDS
              </a>
            ) : (
              <span className="block w-full text-center rounded-md bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4">
                CLAIM LINK UNAVAILABLE
              </span>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(AirdropCard);
