import { WatchlistItem, Movie, TvShow } from '@/types/movie';

const WATCHLIST_STORAGE_KEY = 'couchpotato_watchlist';

export const watchlistService = {
  // Get user's watchlist
  getWatchlist(userId: string): WatchlistItem[] {
    try {
      const allWatchlists = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '{}');
      return allWatchlists[userId] || [];
    } catch {
      return [];
    }
  },

  // Add item to watchlist
  addToWatchlist(userId: string, item: Movie | TvShow, type: 'movie' | 'tv'): boolean {
    try {
      const allWatchlists = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '{}');
      
      if (!allWatchlists[userId]) {
        allWatchlists[userId] = [];
      }

      // Check if item already exists
      const exists = allWatchlists[userId].some((watchlistItem: WatchlistItem) => 
        watchlistItem.id === item.id && watchlistItem.type === type
      );

      if (exists) {
        return false; // Already in watchlist
      }

      // Create watchlist item
      const watchlistItem: WatchlistItem = {
        id: item.id,
        title: type === 'movie' ? (item as Movie).title : (item as TvShow).name,
        type,
        poster_path: item.poster_path,
        overview: item.overview,
        release_date: type === 'movie' ? (item as Movie).release_date : undefined,
        first_air_date: type === 'tv' ? (item as TvShow).first_air_date : undefined,
        vote_average: item.vote_average,
        addedAt: new Date().toISOString(),
        userId
      };

      allWatchlists[userId].push(watchlistItem);
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(allWatchlists));
      
      return true;
    } catch {
      return false;
    }
  },

  // Remove item from watchlist
  removeFromWatchlist(userId: string, id: number, type: 'movie' | 'tv'): boolean {
    try {
      const allWatchlists = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '{}');
      
      if (!allWatchlists[userId]) {
        return false;
      }

      const originalLength = allWatchlists[userId].length;
      allWatchlists[userId] = allWatchlists[userId].filter((item: WatchlistItem) => 
        !(item.id === id && item.type === type)
      );

      if (allWatchlists[userId].length < originalLength) {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(allWatchlists));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  // Check if item is in watchlist
  isInWatchlist(userId: string, id: number, type: 'movie' | 'tv'): boolean {
    try {
      const watchlist = this.getWatchlist(userId);
      return watchlist.some(item => item.id === id && item.type === type);
    } catch {
      return false;
    }
  },

  // Clear entire watchlist
  clearWatchlist(userId: string): boolean {
    try {
      const allWatchlists = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '{}');
      delete allWatchlists[userId];
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(allWatchlists));
      return true;
    } catch {
      return false;
    }
  },

  // Get watchlist statistics
  getWatchlistStats(userId: string): { total: number; movies: number; tvShows: number } {
    try {
      const watchlist = this.getWatchlist(userId);
      return {
        total: watchlist.length,
        movies: watchlist.filter(item => item.type === 'movie').length,
        tvShows: watchlist.filter(item => item.type === 'tv').length
      };
    } catch {
      return { total: 0, movies: 0, tvShows: 0 };
    }
  }
};
