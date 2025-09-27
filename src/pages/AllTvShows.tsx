import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { TvShow } from '@/types/movie';
import TvCard from '@/components/tv/TvCard';
import MoviePlayer from '@/components/player/MoviePlayer';
import AlphabetNavigator from '@/components/ui/alphabet-navigator';
import Header from '@/components/layout/Header';
import { NetflixButton } from '@/components/ui/netflix-button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllTvShows = () => {
  const [selectedTvShow, setSelectedTvShow] = useState<number | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [allTvShows, setAllTvShows] = useState<TvShow[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch comprehensive TV show catalog using the new comprehensive method
  const { data: comprehensiveTvShows, isLoading: isLoadingComprehensive } = useQuery({
    queryKey: ['comprehensiveTvShows'],
    queryFn: () => tmdbService.getComprehensiveTvShows(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load additional pages dynamically for infinite content
  const loadMoreTvShows = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const startPage = currentPage * 20 + 1;
      const endPage = startPage + 19;
      const moreTvShows = await tmdbService.getTvShowsMultiPage(startPage, endPage);
      
      setAllTvShows(prev => {
        const combined = [...prev, ...moreTvShows];
        // Remove duplicates
        const unique = combined.filter((show, index, self) => 
          index === self.findIndex(s => s.id === show.id)
        );
        return unique.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more TV shows:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (comprehensiveTvShows) {
      const sortedTvShows = comprehensiveTvShows.sort((a, b) => a.name.localeCompare(b.name));
      setAllTvShows(sortedTvShows);
    }
  }, [comprehensiveTvShows]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreTvShows();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, isLoadingMore]);

  const handlePlay = (tvId: number) => {
    setSelectedTvShow(tvId);
  };

  const handleClosePlayer = () => {
    setSelectedTvShow(null);
  };

  // Alphabetical grouping for quick navigation

  // Group TV shows by first letter for scroll navigation
  const showsByLetter = allTvShows.reduce((acc, show) => {
    const firstLetter = show.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(show);
    return acc;
  }, {} as Record<string, TvShow[]>);

  const availableLetters = Object.keys(showsByLetter).sort();

  if (selectedTvShow) {
    return (
      <MoviePlayer
        movieId={selectedTvShow}
        mediaType="tv"
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="tv" onTabChange={() => {}} />
      
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
            <h1 className="text-3xl lg:text-4xl font-bold">All TV Shows</h1>
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

          {/* TV Shows by Alphabet Sections */}
          <div className="flex-1 px-4 lg:px-12">
            <div className="space-y-10">
              {availableLetters.map((letter) => (
                <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {letter} <span className="text-muted-foreground">({showsByLetter[letter].length})</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 card-grid">
                    {showsByLetter[letter].map((show) => (
                      <TvCard key={show.id} tvShow={show} onPlay={handlePlay} />
                    ))}
                  </div>
                </section>
              ))}

              {availableLetters.length === 0 && !isLoadingComprehensive && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No TV shows to display.</p>
                </div>
              )}

              {isLoadingComprehensive && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Loading comprehensive TV show catalog...</p>
                </div>
              )}

              {/* Load more indicator */}
              {isLoadingMore && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading more TV shows...</p>
                </div>
              )}

              {/* TV show count and load more button */}
              {allTvShows.length > 0 && (
                <div className="text-center py-8 border-t border-border/20">
                  <p className="text-muted-foreground mb-4">
                    Showing {allTvShows.length} TV shows • Scroll down to load more
                  </p>
                  <NetflixButton
                    onClick={loadMoreTvShows}
                    disabled={isLoadingMore}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More TV Shows'}
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

export default AllTvShows;