import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '@/types/movie';
import { tmdbService } from '@/lib/tmdb';
import { NetflixButton } from '@/components/ui/netflix-button';

interface HeroSectionProps {
  movie: Movie;
  onPlay: (movieId: number) => void;
}

const HeroSection = ({ movie, onPlay }: HeroSectionProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [movie.id]);

  if (!movie) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={tmdbService.getBackdropUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className={`w-full h-full object-cover transition-smooth duration-1000 ${
            imageLoaded ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-background via-muted to-background animate-pulse" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-4 lg:px-12 max-w-2xl space-y-6">
          {/* Movie Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-shadow leading-tight">
            {movie.title}
          </h1>

          {/* Movie Details */}
          <div className="flex items-center space-x-4 text-sm lg:text-base">
            <span className="text-green-400 font-medium">
              {Math.round(movie.vote_average * 10)}% Match
            </span>
            <span className="text-foreground">
              {movie.release_date?.split('-')[0]}
            </span>
            <span className="border border-muted-foreground px-2 py-1 text-xs">
              HD
            </span>
            <span className="border border-muted-foreground px-2 py-1 text-xs">
              18+
            </span>
          </div>

          {/* Movie Overview */}
          <p className="text-lg text-shadow max-w-xl leading-relaxed">
            {movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <NetflixButton
              variant="play"
              size="xl"
              onClick={() => onPlay(movie.id)}
              className="shadow-glow"
            >
              <Play className="h-6 w-6 fill-current" />
              Play
            </NetflixButton>

            <NetflixButton
              variant="info"
              size="xl"
            >
              <Info className="h-5 w-5" />
              More Info
            </NetflixButton>
          </div>
        </div>
      </div>

      {/* Audio Control */}
      <div className="absolute bottom-8 right-8">
        <NetflixButton
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-muted/60 hover:bg-muted backdrop-blur-strong border border-border"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </NetflixButton>
      </div>

      {/* Age Rating Badge */}
      <div className="absolute top-24 right-8 bg-card/80 backdrop-blur-strong border border-border rounded-lg p-2">
        <span className="text-sm font-medium">18+</span>
      </div>
    </div>
  );
};

export default HeroSection;