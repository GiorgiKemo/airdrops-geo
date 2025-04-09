import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { trackingService } from '../services/trackingService';

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [trackedAirdrops, setTrackedAirdrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch tracked airdrops when user changes
  useEffect(() => {
    if (user) {
      // Small delay to ensure auth token is properly set up
      const timer = setTimeout(() => {
        fetchTrackedAirdrops();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setTrackedAirdrops([]);
    }
  }, [user]);

  // Fetch tracked airdrops
  const fetchTrackedAirdrops = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await trackingService.getTrackedAirdrops();
      setTrackedAirdrops(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tracked airdrops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Track an airdrop
  const trackAirdrop = async (airdropId) => {
    if (!user) return;

    setLoading(true);
    try {
      await trackingService.trackAirdrop(null, airdropId);
      await fetchTrackedAirdrops(); // Refresh the list
      setError(null);
    } catch (err) {
      setError('Failed to track airdrop');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Untrack an airdrop
  const untrackAirdrop = async (airdropId) => {
    if (!user) return;

    setLoading(true);
    try {
      await trackingService.untrackAirdrop(null, airdropId);
      await fetchTrackedAirdrops(); // Refresh the list
      setError(null);
    } catch (err) {
      setError('Failed to untrack airdrop');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if an airdrop is being tracked
  const isTracked = (airdropId) => {
    return trackedAirdrops.some(airdrop => airdrop._id === airdropId);
  };

  return (
    <TrackingContext.Provider
      value={{
        trackedAirdrops,
        loading,
        error,
        trackAirdrop,
        untrackAirdrop,
        isTracked,
        refreshTracking: fetchTrackedAirdrops
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

// Custom hook to use the tracking context
export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
