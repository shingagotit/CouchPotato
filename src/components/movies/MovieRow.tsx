import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import { NetflixButton } from '@/components/ui/netflix-button';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movieId: number) => void;
}

const MovieRow = ({ title, movies, onPlay }: MovieRowProps) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + 
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="relative group">
      {/* Section Title with See All Button */}
      <div className="flex items-center justify-between mb-4 px-4 lg:px-12">
        <h2 className="text-xl lg:text-2xl font-bold">
          {title}
        </h2>
        <NetflixButton
          variant="ghost"
          onClick={() => window.location.href = '/movies'}
          className="text-muted-foreground hover:text-primary text-sm"
        >
          See All
        </NetflixButton>
      </div>

      {/* Scrollable Movie Row */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <NetflixButton
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/80 hover:bg-black/90 text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-smooth"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-6 w-6" />
          </NetflixButton>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <NetflixButton
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/80 hover:bg-black/90 text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-smooth"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-6 w-6" />
          </NetflixButton>
        )}

        {/* Movies Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-2 movie-row-container px-4 lg:px-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
          onScroll={handleScroll}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-48 lg:w-56">
              <MovieCard movie={movie} onPlay={onPlay} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;