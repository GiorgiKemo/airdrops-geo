import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTracking } from '../context/TrackingContext';
import { useNavigate } from 'react-router-dom';

// This component is now both a status indicator and a button
const TrackButton = ({ airdropId, onClick }) => {
  const { user } = useAuth();
  const { isTracked, trackAirdrop, untrackAirdrop, loading } = useTracking();
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const safeAirdropId = typeof airdropId === 'string' && airdropId.trim() ? airdropId.trim() : '';
  const tracked = safeAirdropId ? isTracked(safeAirdropId) : false;

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Prevent event bubbling

    if (!safeAirdropId) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (tracked) {
      await untrackAirdrop(safeAirdropId);
    } else {
      await trackAirdrop(safeAirdropId);
    }

    // Call the parent's onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={loading || !safeAirdropId}
      className={`flex items-center justify-center p-1 rounded-full transition-colors duration-200 shadow-sm ${
        tracked
          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400'
      }`}
      aria-label={tracked ? 'Untrack airdrop' : 'Track airdrop'}
      title={!safeAirdropId ? 'Tracking is unavailable for this airdrop' : undefined}
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : tracked ? (
        isHovering ? (
          // Show X icon when hovering over a tracked airdrop
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          // Show check icon for tracked airdrops
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      ) : (
        // Show plus icon for untracked airdrops
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

export default TrackButton;
