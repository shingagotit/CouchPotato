import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Movie, TvShow } from '@/types/movie';
import { tmdbService } from '@/lib/tmdb';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/movies/HeroSection';
import TvHeroSection from '@/components/tv/TvHeroSection';
import MovieRow from '@/components/movies/MovieRow';
import TvRow from '@/components/tv/TvRow';
import MoviePlayer from '@/components/player/MoviePlayer';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'movie' | 'tv'>('movie');
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'search'>('movies');
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [heroTvShow, setHeroTvShow] = useState<TvShow | null>(null);

  // Fetch multiple pages of popular movies for comprehensive display
  const { data: popularMoviesP1 } = useQuery({
    queryKey: ['popular-movies', 1],
    queryFn: () => tmdbService.getPopularMovies(1),
  });

  const { data: popularMoviesP2 } = useQuery({
    queryKey: ['popular-movies', 2],
    queryFn: () => tmdbService.getPopularMovies(2),
  });

  const { data: popularMoviesP3 } = useQuery({
    queryKey: ['popular-movies', 3],
    queryFn: () => tmdbService.getPopularMovies(3),
  });

  // Fetch trending movies
  const { data: trendingMovies } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => tmdbService.getTrendingMovies(),
  });

  // Fetch multiple pages of top rated movies
  const { data: topRatedMoviesP1 } = useQuery({
    queryKey: ['top-rated-movies', 1],
    queryFn: () => tmdbService.getTopRatedMovies(),
  });

  const { data: topRatedMoviesP2 } = useQuery({
    queryKey: ['top-rated-movies-page2'],
    queryFn: () => tmdbService.getAllMovies(1),
  });

  // Fetch now playing movies
  const { data: nowPlayingMovies } = useQuery({
    queryKey: ['now-playing-movies'],
    queryFn: () => tmdbService.getNowPlayingMovies(),
  });

  // Fetch upcoming movies
  const { data: upcomingMovies } = useQuery({
    queryKey: ['upcoming-movies'],
    queryFn: () => tmdbService.getUpcomingMovies(),
  });

  // Fetch multiple pages of TV show data
  const { data: popularTvShowsP1 } = useQuery({
    queryKey: ['popular-tv-shows', 1],
    queryFn: () => tmdbService.getPopularTvShows(1),
    enabled: activeTab === 'tv',
  });

  const { data: popularTvShowsP2 } = useQuery({
    queryKey: ['popular-tv-shows', 2],
    queryFn: () => tmdbService.getPopularTvShows(2),
    enabled: activeTab === 'tv',
  });

  const { data: popularTvShowsP3 } = useQuery({
    queryKey: ['popular-tv-shows', 3],
    queryFn: () => tmdbService.getPopularTvShows(3),
    enabled: activeTab === 'tv',
  });

  const { data: trendingTvShows } = useQuery({
    queryKey: ['trending-tv-shows'],
    queryFn: () => tmdbService.getTrendingTvShows(),
    enabled: activeTab === 'tv',
  });

  const { data: topRatedTvShowsP1 } = useQuery({
    queryKey: ['top-rated-tv-shows', 1],
    queryFn: () => tmdbService.getTopRatedTvShows(),
    enabled: activeTab === 'tv',
  });

  const { data: topRatedTvShowsP2 } = useQuery({
    queryKey: ['top-rated-tv-shows-page2'],
    queryFn: () => tmdbService.getAllTvShows(1),
    enabled: activeTab === 'tv',
  });

  const { data: airingTodayTvShows } = useQuery({
    queryKey: ['airing-today-tv-shows'],
    queryFn: () => tmdbService.getAiringTodayTvShows(),
    enabled: activeTab === 'tv',
  });

  const { data: onTheAirTvShows } = useQuery({
    queryKey: ['on-the-air-tv-shows'],
    queryFn: () => tmdbService.getOnTheAirTvShows(),
    enabled: activeTab === 'tv',
  });

  // Set hero content based on active tab
  useEffect(() => {
    if (activeTab === 'movies' && trendingMovies?.results && trendingMovies.results.length > 0) {
      setHeroMovie(trendingMovies.results[0]);
      setHeroTvShow(null);
    }
  }, [trendingMovies, activeTab]);

  useEffect(() => {
    if (activeTab === 'tv' && trendingTvShows?.results && trendingTvShows.results.length > 0) {
      setHeroTvShow(trendingTvShows.results[0]);
      setHeroMovie(null);
    }
  }, [trendingTvShows, activeTab]);

  const handlePlayMovie = (movieId: number) => {
    setSelectedMovieId(movieId);
    setSelectedMediaType('movie');
    toast({
      title: "Opening Movie Player",
      description: "Loading your movie...",
    });
  };

  const handlePlayTvShow = (tvId: number) => {
    setSelectedMovieId(tvId);
    setSelectedMediaType('tv');
    toast({
      title: "Opening TV Show Player",
      description: "Loading your show...",
    });
  };

  const handleTabChange = (tab: 'movies' | 'tv' | 'search') => {
    if (tab === 'search') {
      window.location.href = '/search';
      return;
    }
    setActiveTab(tab);
  };

  const handleClosePlayer = () => {
    setSelectedMovieId(null);
  };

  // Combine movie data from multiple pages for richer content
  const popularMovies = {
    results: [
      ...(popularMoviesP1?.results || []),
      ...(popularMoviesP2?.results || []),
      ...(popularMoviesP3?.results || [])
    ]
  };

  const topRatedMovies = {
    results: [
      ...(topRatedMoviesP1?.results || []),
      ...(topRatedMoviesP2?.results || [])
    ]
  };

  // Combine TV show data from multiple pages
  const popularTvShows = {
    results: [
      ...(popularTvShowsP1?.results || []),
      ...(popularTvShowsP2?.results || []),
      ...(popularTvShowsP3?.results || [])
    ]
  };

  const topRatedTvShows = {
    results: [
      ...(topRatedTvShowsP1?.results || []),
      ...(topRatedTvShowsP2?.results || [])
    ]
  };

  const isLoading = false; // Remove loading state since we want to show content as it loads

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Hero Sections */}
      {activeTab === 'movies' && heroMovie && (
        <HeroSection movie={heroMovie} onPlay={handlePlayMovie} />
      )}
      
      {activeTab === 'tv' && heroTvShow && (
        <TvHeroSection tvShow={heroTvShow} onPlay={handlePlayTvShow} />
      )}

      <div className="space-y-12 -mt-32 relative z-10">
        {activeTab === 'movies' && (
          <>
            {popularMovies?.results?.length > 0 && (
              <MovieRow
                title="Popular Movies"
                movies={popularMovies.results}
                onPlay={handlePlayMovie}
              />
            )}

            {trendingMovies?.results && (
              <MovieRow
                title="Trending Now"
                movies={trendingMovies.results}
                onPlay={handlePlayMovie}
              />
            )}

            {nowPlayingMovies?.results && (
              <MovieRow
                title="Now Playing"
                movies={nowPlayingMovies.results}
                onPlay={handlePlayMovie}
              />
            )}

            {topRatedMovies?.results?.length > 0 && (
              <MovieRow
                title="Top Rated"
                movies={topRatedMovies.results}
                onPlay={handlePlayMovie}
              />
            )}

            {upcomingMovies?.results && (
              <MovieRow
                title="Coming Soon"
                movies={upcomingMovies.results}
                onPlay={handlePlayMovie}
              />
            )}
          </>
        )}

        {activeTab === 'tv' && (
          <>
            {popularTvShows?.results?.length > 0 && (
              <TvRow
                title="Popular TV Shows"
                tvShows={popularTvShows.results}
                onPlay={handlePlayTvShow}
              />
            )}

            {trendingTvShows?.results && (
              <TvRow
                title="Trending Now"
                tvShows={trendingTvShows.results}
                onPlay={handlePlayTvShow}
              />
            )}

            {airingTodayTvShows?.results && (
              <TvRow
                title="Airing Today"
                tvShows={airingTodayTvShows.results}
                onPlay={handlePlayTvShow}
              />
            )}

            {topRatedTvShows?.results?.length > 0 && (
              <TvRow
                title="Top Rated"
                tvShows={topRatedTvShows.results}
                onPlay={handlePlayTvShow}
              />
            )}

            {onTheAirTvShows?.results && (
              <TvRow
                title="On The Air"
                tvShows={onTheAirTvShows.results}
                onPlay={handlePlayTvShow}
              />
            )}
          </>
        )}
      </div>

      {/* Footer spacing */}
      <div className="h-32" />

      {/* Movie/TV Player Modal */}
      {selectedMovieId && (
        <MoviePlayer
          movieId={selectedMovieId}
          mediaType={selectedMediaType}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default Index;
