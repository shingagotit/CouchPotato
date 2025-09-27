import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NetflixButton } from '@/components/ui/netflix-button';
import { tmdbService } from '@/lib/tmdb';

interface MoviePlayerProps {
  movieId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onClose: () => void;
}

const MoviePlayer = ({ 
  movieId, 
  mediaType, 
  season = 1, 
  episode = 1, 
  onClose 
}: MoviePlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Generate VidKing URL with purple theme and features
  const playerUrl = tmdbService.generateVidKingUrl(movieId, mediaType, {
    season,
    episode,
    color: '8b5cf6', // Purple theme matching our design
    autoPlay: true,
    nextEpisode: mediaType === 'tv',
    episodeSelector: mediaType === 'tv',
  });

  // Listen for player events (progress tracking, etc.)
  const handlePlayerMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'PLAYER_EVENT') {
        console.log('Player Event:', data.data);
        // You can handle player events here:
        // - Save watch progress to localStorage or backend
        // - Update user history
        // - Analytics tracking
        // - Resume functionality
        // - Automatic episode progression
        
        const { event: playerEvent, currentTime, duration, progress } = data.data;
        
        // Example: Save progress for resume functionality
        if (playerEvent === 'timeupdate' && progress > 5) {
          localStorage.setItem(`progress_${mediaType}_${movieId}`, JSON.stringify({
            currentTime,
            duration,
            progress,
            timestamp: Date.now()
          }));
        }
      }
    } catch (error) {
      // Ignore non-JSON messages
    }
  };

  // Add event listener for player messages
  useEffect(() => {
    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [movieId, mediaType]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-lg font-semibold">
            {mediaType === 'tv' ? `Season ${season}, Episode ${episode}` : 'Now Playing'}
          </h2>
        </div>
        
        <NetflixButton
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-10 w-10"
        >
          <X className="h-6 w-6" />
        </NetflixButton>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white text-lg">Loading {mediaType === 'movie' ? 'movie' : 'episode'}...</p>
          </div>
        </div>
      )}

      {/* Player iframe */}
      <div className="flex-1 relative">
        <iframe
          src={playerUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          onLoad={() => setIsLoading(false)}
          title={`${mediaType === 'movie' ? 'Movie' : 'TV Show'} Player`}
        />
      </div>
    </div>
  );
};

export default MoviePlayer;