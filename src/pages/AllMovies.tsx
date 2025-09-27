import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/movies/MovieCard';
import MoviePlayer from '@/components/player/MoviePlayer';
import AlphabetNavigator from '@/components/ui/alphabet-navigator';
import Header from '@/components/layout/Header';
import { NetflixButton } from '@/components/ui/netflix-button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllMovies = () => {
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch comprehensive movie catalog using the new comprehensive method
  const { data: comprehensiveMovies, isLoading: isLoadingComprehensive } = useQuery({
    queryKey: ['comprehensiveMovies'],
    queryFn: () => tmdbService.getComprehensiveMovies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load additional pages dynamically for infinite content
  const loadMoreMovies = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const startPage = currentPage * 20 + 1;
      const endPage = startPage + 19;
      const moreMovies = await tmdbService.getMoviesMultiPage(startPage, endPage);
      
      setAllMovies(prev => {
        const combined = [...prev, ...moreMovies];
        // Remove duplicates
        const unique = combined.filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );
        return unique.sort((a, b) => a.title.localeCompare(b.title));
      });
      
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (comprehensiveMovies) {
      const sortedMovies = comprehensiveMovies.sort((a, b) => a.title.localeCompare(b.title));
      setAllMovies(sortedMovies);
    }
  }, [comprehensiveMovies]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreMovies();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, isLoadingMore]);

  const handlePlay = (movieId: number) => {
    setSelectedMovie(movieId);
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  // Alphabetical grouping for quick navigation

  // Group movies by first letter for scroll navigation
  const moviesByLetter = allMovies.reduce((acc, movie) => {
    const firstLetter = movie.title.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(movie);
    return acc;
  }, {} as Record<string, Movie[]>);

  const availableLetters = Object.keys(moviesByLetter).sort();

  if (selectedMovie) {
    return (
      <MoviePlayer
        movieId={selectedMovie}
        mediaType="movie"
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="movies" onTabChange={() => {}} />
      
      <div className="pt-24 pb-8">
        <div className="px-4 lg:px-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <NetflixButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </NetflixButton>
            <h1 className="text-3xl lg:text-4xl font-bold">All Movies</h1>
          </div>
        </div>

        <div className="flex">
          {/* Alphabet Navigator */}
          <div className="sticky top-24 h-fit">
            <AlphabetNavigator
              availableLetters={availableLetters}
              selectedLetter={selectedLetter}
              onLetterSelect={(letter) => {
                setSelectedLetter(letter);
                const el = document.getElementById(`letter-${letter}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </div>

          {/* Movies by Alphabet Sections */}
          <div className="flex-1 px-4 lg:px-12">
            <div className="space-y-10">
              {availableLetters.map((letter) => (
                <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {letter} <span className="text-muted-foreground">({moviesByLetter[letter].length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 card-grid">
                    {moviesByLetter[letter].map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onPlay={handlePlay} />
                    ))}
                  </div>
                </section>
              ))}

              {availableLetters.length === 0 && !isLoadingComprehensive && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No movies to display.</p>
                </div>
              )}

              {isLoadingComprehensive && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Loading comprehensive movie catalog...</p>
                </div>
              )}

              {/* Load more indicator */}
              {isLoadingMore && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading more movies...</p>
                </div>
              )}

              {/* Movie count and load more button */}
              {allMovies.length > 0 && (
                <div className="text-center py-8 border-t border-border/20">
                  <p className="text-muted-foreground mb-4">
                    Showing {allMovies.length} movies • Scroll down to load more
                  </p>
                  <NetflixButton
                    onClick={loadMoreMovies}
                    disabled={isLoadingMore}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Movies'}
                  </NetflixButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMovies;