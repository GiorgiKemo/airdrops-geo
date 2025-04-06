import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTracking } from '../context/TrackingContext';
import { useNavigate } from 'react-router-dom';
import TrackButton from './TrackButton';

// Helper function to format image URLs
const formatImageUrl = (url) => {
  if (!url) return '';

  // Handle Imgur gallery URLs
  if (url.includes('imgur.com/gallery/')) {
    // Extract the ID from the gallery URL
    const galleryId = url.split('/').pop();
    // Convert to direct image URL format
    return `https://i.imgur.com/${galleryId}.jpg`;
  }

  // Handle other Imgur URLs that aren't direct links
  if (url.includes('imgur.com/') && !url.includes('i.imgur.com/')) {
    const imgurId = url.split('/').pop();
    return `https://i.imgur.com/${imgurId}.jpg`;
  }

  // Return the original URL for all other cases
  return url;
};

const AirdropLogo = ({ airdrop, size = 'medium' }) => {
  const { user } = useAuth();
  const { isTracked, trackAirdrop, untrackAirdrop, loading } = useTracking();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const tracked = isTracked(airdrop._id);

  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8 sm:w-10 sm:h-10',
    medium: 'w-10 h-10 sm:w-12 sm:h-12',
    large: 'w-12 h-12 sm:w-16 sm:h-16'
  };

  // Handle logo click for tracking
  const handleLogoClick = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!user) {
      navigate('/login');
      return;
    }

    if (tracked) {
      await untrackAirdrop(airdrop._id);
    } else {
      await trackAirdrop(airdrop._id);
    }
  };

  return (
    <div className="relative">
      {/* Logo - clickable for tracking */}
      <button
        onClick={handleLogoClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        disabled={loading}
        className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden transition-all duration-200 ${
          tracked ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
        } ${
          isHovering ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-800' : ''
        } cursor-pointer`}
        aria-label={tracked ? 'Remove from My Airdrops' : 'Add to My Airdrops'}
      >
        {airdrop.logoUrl ? (
          <img
            src={formatImageUrl(airdrop.logoUrl)}
            alt={`${airdrop.token} logo`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show the first letter instead
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
        ) : null}
        {/* Default logo or fallback - first letter of token */}
        <span
          className={`font-bold text-gray-600 dark:text-gray-300 ${
            size === 'large' ? 'text-3xl' : 'text-xl'
          }`}
          style={{ display: airdrop.logoUrl ? 'none' : 'block' }}
        >
          {airdrop.token.charAt(0)}
        </span>
      </button>

      {/* Status indicator */}
      <div className="absolute -bottom-1 -right-1">
        <TrackButton airdropId={airdrop._id} />
      </div>
    </div>
  );
};

export default AirdropLogo;
