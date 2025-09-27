import { useState } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown, Check } from 'lucide-react';
import { TvShow } from '@/types/movie';
import { tmdbService } from '@/lib/tmdb';
import { NetflixButton } from '@/components/ui/netflix-button';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { AdaptiveHoverCard } from '@/components/ui/adaptive-hover-card';

interface TvCardProps {
  tvShow: TvShow;
  onPlay: (tvId: number) => void;
}

const TvCard = ({ tvShow, onPlay }: TvCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const handlePlay = () => {
    onPlay(tvShow.id);
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist(tvShow.id, 'tv')) {
      removeFromWatchlist(tvShow.id, 'tv');
    } else {
      addToWatchlist(tvShow, 'tv');
    }
  };

  const inWatchlist = isInWatchlist(tvShow.id, 'tv');

  return (
    <div
      className="group relative cursor-pointer transition-smooth hover-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* TV Show Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-card">
        <img
          src={tmdbService.getImageUrl(tvShow.poster_path)}
          alt={tvShow.name}
          className={`w-full h-full object-cover transition-smooth group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-smooth" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
          <NetflixButton
            variant="play"
            size="lg"
            onClick={handlePlay}
            className="shadow-glow"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </NetflixButton>
        </div>
      </div>

      {/* Hover Card */}
      <AdaptiveHoverCard isVisible={isHovered}>
        {/* TV Show backdrop */}
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
          <img
            src={tmdbService.getBackdropUrl(tvShow.backdrop_path)}
            alt={tvShow.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay" />
          <NetflixButton
            variant="play"
            size="sm"
            onClick={handlePlay}
            className="absolute bottom-3 left-3"
          >
            <Play className="h-4 w-4 fill-current" />
          </NetflixButton>
        </div>

        {/* TV Show info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {tvShow.name}
            </h3>
            <div className="flex items-center space-x-1">
              <NetflixButton 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${inWatchlist ? 'text-red-500 hover:text-red-600' : 'hover:text-primary'}`}
                onClick={handleWatchlistToggle}
                title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </NetflixButton>
              <NetflixButton variant="ghost" size="icon" className="h-8 w-8">
                <ThumbsUp className="h-4 w-4" />
              </NetflixButton>
              <NetflixButton variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </NetflixButton>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <span className="text-green-400 font-medium">
              {Math.round(tvShow.vote_average * 10)}% Match
            </span>
            <span className="text-muted-foreground">
              {tvShow.first_air_date?.split('-')[0]}
            </span>
            <span className="border border-muted-foreground px-1 text-xs">
              HD
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {tvShow.overview}
          </p>
        </div>
      </AdaptiveHoverCard>
    </div>
  );
};

export default TvCard;