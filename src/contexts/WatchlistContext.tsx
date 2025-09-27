import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WatchlistItem, WatchlistContextType, Movie, TvShow } from '@/types/movie';
import { watchlistService } from '@/lib/watchlist';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

interface WatchlistProviderProps {
  children: ReactNode;
}

export const WatchlistProvider: React.FC<WatchlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load watchlist when user changes
  useEffect(() => {
    if (user?.id) {
      const userWatchlist = watchlistService.getWatchlist(user.id);
      setWatchlist(userWatchlist);
    } else {
      setWatchlist([]);
    }
  }, [user?.id]);

  const addToWatchlist = (item: Movie | TvShow, type?: 'movie' | 'tv') => {
    if (!user?.id) return;

    // Determine type if not provided
    const itemType = type || ('title' in item ? 'movie' : 'tv');
    
    const success = watchlistService.addToWatchlist(user.id, item, itemType);
    if (success) {
      const updatedWatchlist = watchlistService.getWatchlist(user.id);
      setWatchlist(updatedWatchlist);
    }
  };

  const removeFromWatchlist = (id: number, type: 'movie' | 'tv') => {
    if (!user?.id) return;

    const success = watchlistService.removeFromWatchlist(user.id, id, type);
    if (success) {
      const updatedWatchlist = watchlistService.getWatchlist(user.id);
      setWatchlist(updatedWatchlist);
    }
  };

  const isInWatchlist = (id: number, type: 'movie' | 'tv'): boolean => {
    if (!user?.id) return false;
    return watchlistService.isInWatchlist(user.id, id, type);
  };

  const clearWatchlist = () => {
    if (!user?.id) return;

    const success = watchlistService.clearWatchlist(user.id);
    if (success) {
      setWatchlist([]);
    }
  };

  const value: WatchlistContextType = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
