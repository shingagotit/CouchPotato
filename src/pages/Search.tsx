import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { Movie, TvShow } from '@/types/movie';
import MovieCard from '@/components/movies/MovieCard';
import TvCard from '@/components/tv/TvCard';
import MoviePlayer from '@/components/player/MoviePlayer';
import Header from '@/components/layout/Header';
import { NetflixButton } from '@/components/ui/netflix-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'movie' | 'tv'>('movie');
  const [sortBy, setSortBy] = useState('popularity');
  const [yearFilter, setYearFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const navigate = useNavigate();

  // Search movies
  const { data: movieResults, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['searchMovies', searchQuery],
    queryFn: () => tmdbService.searchMovies(searchQuery),
    enabled: searchQuery.trim().length > 0 && activeTab === 'movies',
  });

  // Search TV shows
  const { data: tvResults, isLoading: isLoadingTv } = useQuery({
    queryKey: ['searchTvShows', searchQuery],
    queryFn: () => tmdbService.searchTvShows(searchQuery),
    enabled: searchQuery.trim().length > 0 && activeTab === 'tv',
  });

  const handlePlay = (id: number, mediaType: 'movie' | 'tv') => {
    setSelectedMovie(id);
    setSelectedMediaType(mediaType);
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  const filterAndSortResults = (results: Movie[] | TvShow[]) => {
    if (!results) return [];

    let filtered = [...results];

    // Filter by year
    if (yearFilter && yearFilter !== 'all') {
      filtered = filtered.filter(item => {
        const year = 'release_date' in item 
          ? new Date(item.release_date).getFullYear()
          : new Date(item.first_air_date).getFullYear();
        return year.toString() === yearFilter;
      });
    }

    // Filter by rating
    if (ratingFilter && ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(item => item.vote_average >= minRating);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'date':
          const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
          const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        case 'alphabetical':
          const titleA = 'title' in a ? a.title : a.name;
          const titleB = 'title' in b ? b.title : b.name;
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredMovies = filterAndSortResults(movieResults?.results || []) as Movie[];
  const filteredTvShows = filterAndSortResults(tvResults?.results || []) as TvShow[];

  if (selectedMovie) {
    return (
      <MoviePlayer
        movieId={selectedMovie}
        mediaType={selectedMediaType}
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="search" onTabChange={() => {}} />
      
      <div className="pt-24 pb-8">
        <div className="px-4 lg:px-12">
          <div className="flex items-center gap-4 mb-8">
            <NetflixButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </NetflixButton>
            <h1 className="text-3xl lg:text-4xl font-bold">Search</h1>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-muted/50 border-border focus:border-primary"
            />
          </div>

          {/* Filters */}
          <Card className="mb-8 bg-muted/20 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="sort">Sort by</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="date">Release Date</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any year</SelectItem>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rating</SelectItem>
                      <SelectItem value="9">9+ Stars</SelectItem>
                      <SelectItem value="8">8+ Stars</SelectItem>
                      <SelectItem value="7">7+ Stars</SelectItem>
                      <SelectItem value="6">6+ Stars</SelectItem>
                      <SelectItem value="5">5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <NetflixButton 
                    variant="outline" 
                    onClick={() => {
                      setSortBy('popularity');
                      setYearFilter('all');
                      setRatingFilter('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </NetflixButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Movies/TV */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'movies' | 'tv')}>
            <TabsList className="mb-8">
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
            </TabsList>

            <TabsContent value="movies">
              {searchQuery.trim().length === 0 ? (
                <div className="text-center py-12">
                  <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Start typing to search for movies...
                  </p>
                </div>
              ) : isLoadingMovies ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Searching movies...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredMovies.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onPlay={(id) => handlePlay(id, 'movie')} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tv">
              {searchQuery.trim().length === 0 ? (
                <div className="text-center py-12">
                  <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Start typing to search for TV shows...
                  </p>
                </div>
              ) : isLoadingTv ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Searching TV shows...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredTvShows.map((show) => (
                    <TvCard 
                      key={show.id} 
                      tvShow={show} 
                      onPlay={(id) => handlePlay(id, 'tv')} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* No Results */}
          {searchQuery.length > 2 && !isLoadingMovies && !isLoadingTv && 
           filteredMovies.length === 0 && filteredTvShows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No results found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;