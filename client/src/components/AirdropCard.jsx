import { Link } from 'react-router-dom';
import AirdropLogo from './AirdropLogo';
import { FaGlobe, FaDiscord, FaTelegram, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const AirdropCard = ({ airdrop }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white font-bold';
      case 'upcoming':
        return 'bg-blue-600 text-white font-bold';
      case 'ended':
        return 'bg-gray-600 text-white font-bold';
      default:
        return 'bg-gray-600 text-white font-bold';
    }
  };

  // Get card color based on airdrop settings
  const getCardColor = () => {
    // Debug airdrop data
    console.log('Airdrop data:', airdrop);
    console.log('Card color:', airdrop.cardColor);
    console.log('Predefined color:', airdrop.predefinedColor);
    console.log('Social Links:', airdrop.socialLinks);

    // If custom color is provided, use it
    if (airdrop.cardColor && airdrop.cardColor.trim() !== '') {
      console.log('Using custom color:', airdrop.cardColor);
      return airdrop.cardColor;
    }

    // Otherwise, use predefined color
    if (airdrop.predefinedColor && airdrop.predefinedColor !== 'default') {
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
      console.log('Using predefined color:', airdrop.predefinedColor, colorMap[airdrop.predefinedColor]);
      return colorMap[airdrop.predefinedColor] || null;
    }

    // Default: return null to use default styling
    console.log('Using default color');
    return null;
  };

  const cardColor = getCardColor();
  const cardStyle = cardColor ? {
    backgroundColor: cardColor,
    borderColor: 'rgba(0,0,0,0.1)',
    color: '#ffffff' // White text for visibility
  } : {};

  return (
    <div className="group h-full w-full" role="article" aria-labelledby={`airdrop-title-${airdrop._id}`}>
      <Link
        to={`/airdrops/${airdrop._id}`}
        className="macos-card relative block overflow-hidden cursor-pointer h-full w-full z-10 flex flex-col backdrop-blur-md"
        style={{...cardStyle, height: '100%', minHeight: '100%'}}
        aria-describedby={`airdrop-desc-${airdrop._id}`}
      >
        {airdrop.status === 'claim' && (
          <div className="absolute top-0 right-0 z-10 bg-[var(--macos-danger)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
            CLAIM NOW
          </div>
        )}
      <div className="p-2 flex flex-col flex-grow justify-between text-center sm:text-left overflow-hidden">
        <div className="flex justify-between items-start mb-1">
          {/* Logo with track button overlay */}
          <div className="mr-2 sm:mr-3">
            <AirdropLogo airdrop={airdrop} size="medium" />
          </div>

          <div className="flex-1 min-w-0"> {/* min-width: 0 prevents flex child from overflowing */}
            <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-between items-center sm:items-start gap-1">
              <h3 id={`airdrop-title-${airdrop._id}`} className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--macos-text)] truncate">{airdrop.title}</h3>
              {airdrop.status !== 'claim' && (
                <span
                  className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClass(
                    airdrop.status
                  )}`}
                >
                  {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mb-1 text-xs sm:text-sm truncate">Token: {airdrop.token}</p>
        <p id={`airdrop-desc-${airdrop._id}`} className="mb-1 line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm break-words overflow-hidden">{airdrop.description}</p>
        <div className="flex justify-center sm:justify-between items-center mt-auto flex-wrap gap-2">
          <div className="flex flex-col items-center sm:items-start">
            <p className="text-xs sm:text-sm mb-1">
              Start: {formatDate(airdrop.startDate)}
            </p>
            <p className="text-xs sm:text-sm">
              Deadline: {formatDate(airdrop.deadline)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Social Media Links */}
            {airdrop.socialLinks && typeof airdrop.socialLinks === 'object' && Object.values(airdrop.socialLinks).some(link => link && link.trim() !== '') && (
              <div className="flex gap-1 sm:gap-2">
                {console.log('Rendering social links:', airdrop.socialLinks)}
                {airdrop.socialLinks.website && typeof airdrop.socialLinks.website === 'string' && airdrop.socialLinks.website.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Website"
                  >
                    <FaGlobe className="text-xs sm:text-sm" />
                  </a>
                )}
                {airdrop.socialLinks.discord && typeof airdrop.socialLinks.discord === 'string' && airdrop.socialLinks.discord.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#5865F2] dark:hover:text-[#7289DA] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Discord"
                  >
                    <FaDiscord className="text-xs sm:text-sm" />
                  </a>
                )}
                {airdrop.socialLinks.twitter && typeof airdrop.socialLinks.twitter === 'string' && airdrop.socialLinks.twitter.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="X (Twitter)"
                  >
                    <FaXTwitter className="text-xs sm:text-sm" />
                  </a>
                )}
                {airdrop.socialLinks.telegram && typeof airdrop.socialLinks.telegram === 'string' && airdrop.socialLinks.telegram.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#0088cc] dark:hover:text-[#29a9eb] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Telegram"
                  >
                    <FaTelegram className="text-xs sm:text-sm" />
                  </a>
                )}
                {airdrop.socialLinks.github && typeof airdrop.socialLinks.github === 'string' && airdrop.socialLinks.github.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-[#333] dark:hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="GitHub"
                  >
                    <FaGithub className="text-xs sm:text-sm" />
                  </a>
                )}
                {airdrop.socialLinks.instagram && typeof airdrop.socialLinks.instagram === 'string' && airdrop.socialLinks.instagram.trim() !== '' && (
                  <a
                    href={airdrop.socialLinks.instagram}
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
              {typeof airdrop.views === 'number' ? airdrop.views : 0} views
            </span>
          </div>
        </div>

        {/* Claim button - shown when status is claim */}
        {airdrop.status === 'claim' && (
          <div className="mt-1">
            <a
              href={airdrop.claimUrl || airdrop.link}
              target="_blank"
              rel="noopener noreferrer"
              className="macos-button block w-full text-center bg-[var(--macos-danger)] text-white font-bold text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
              onClick={(e) => e.stopPropagation()}
            >
              CLAIM REWARDS
            </a>
          </div>
        )}
      </div>
      </Link>
    </div>
  );
};

export default AirdropCard;
