import React, { useState } from 'react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NetflixButton } from '@/components/ui/netflix-button';
import { WatchlistItem } from '@/types/movie';
import { tmdbService } from '@/lib/tmdb';
import { 
  Heart, 
  Play, 
  Trash2, 
  Calendar, 
  Star, 
  Film, 
  Tv, 
  Clock,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Search,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MyList: React.FC = () => {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'rating'>('added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  // Filter and sort watchlist
  const filteredAndSortedWatchlist = React.useMemo(() => {
    let filtered = watchlist;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = a.vote_average - b.vote_average;
          break;
        case 'added':
        default:
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [watchlist, filterType, sortBy, sortOrder]);

  const stats = {
    total: watchlist.length,
    movies: watchlist.filter(item => item.type === 'movie').length,
    tvShows: watchlist.filter(item => item.type === 'tv').length,
  };

  const handleRemoveItem = (id: number, type: 'movie' | 'tv') => {
    removeFromWatchlist(id, type);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      clearWatchlist();
    }
  };

  const handlePlayRandom = () => {
    if (watchlist.length > 0) {
      const randomItem = watchlist[Math.floor(Math.random() * watchlist.length)];
      // Here you would implement the play functionality
      console.log('Playing random item:', randomItem);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getImageUrl = (posterPath: string | null) => {
    if (!posterPath) return `${import.meta.env.BASE_URL}placeholder.svg`;
    return tmdbService.getImageUrl(posterPath);
  };

  const WatchlistItemCard: React.FC<{ item: WatchlistItem }> = ({ item }) => (
    <div className="group relative cursor-pointer transition-smooth hover-card-container">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-card">
        <img
          src={getImageUrl(item.poster_path)}
          alt={item.title}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-smooth" />

        {/* Type badge */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge 
            variant={item.type === 'movie' ? 'default' : 'secondary'} 
            className="bg-black/80 text-white border-none text-xs"
          >
            {item.type === 'movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
            {item.type === 'movie' ? 'Movie' : 'TV'}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <NetflixButton
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/80 hover:bg-black text-white"
            onClick={() => handleRemoveItem(item.id, item.type)}
          >
            <Trash2 className="h-4 w-4" />
          </NetflixButton>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
          <NetflixButton
            variant="play"
            size="lg"
            className="shadow-glow"
          >
            <Play className="h-5 w-5 fill-current" />
          </NetflixButton>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{item.title}</h3>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center text-green-400">
              <Star className="w-3 h-3 mr-1" />
              <span>{Math.round(item.vote_average * 10)}%</span>
            </div>
            <span className="text-gray-300">
              {item.type === 'movie' 
                ? item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'
                : item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const WatchlistItemRow: React.FC<{ item: WatchlistItem }> = ({ item }) => (
    <div className="group flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
      {/* Poster */}
      <div className="relative flex-shrink-0">
        <img
          src={getImageUrl(item.poster_path)}
          alt={item.title}
          className="w-16 h-24 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="font-semibold text-white text-lg line-clamp-1">{item.title}</h3>
          <Badge 
            variant={item.type === 'movie' ? 'default' : 'secondary'} 
            className={`text-xs ${item.type === 'movie' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'} border-none`}
          >
            {item.type === 'movie' ? <Film className="w-3 h-3 mr-1" /> : <Tv className="w-3 h-3 mr-1" />}
            {item.type === 'movie' ? 'Movie' : 'TV Show'}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-3 leading-relaxed">{item.overview}</p>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center text-green-400">
            <Star className="w-4 h-4 mr-1" />
            <span className="font-medium">{Math.round(item.vote_average * 10)}% Match</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              {item.type === 'movie' 
                ? item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'
                : item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'
              }
            </span>
          </div>
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Added {formatDate(item.addedAt)}</span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <NetflixButton 
          variant="play" 
          size="sm"
          className="bg-white text-black hover:bg-gray-200"
        >
          <Play className="h-4 w-4 mr-1 fill-current" />
          Play
        </NetflixButton>
        <NetflixButton 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 text-white hover:bg-red-600 hover:text-white"
          onClick={() => handleRemoveItem(item.id, item.type)}
        >
          <Trash2 className="h-4 w-4" />
        </NetflixButton>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-netflix-black/50 to-netflix-black" />
        
        {/* Hero content */}
        <div className="relative px-4 lg:px-12 pt-20 pb-16">
          <div className="max-w-2xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center mr-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">My List</h1>
                <p className="text-lg text-gray-300">Your personal collection of favorites</p>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="flex items-center space-x-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{stats.total}</span>
                </div>
                <span className="text-gray-300">Total Items</span>
              </div>
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">{stats.movies} Movies</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tv className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">{stats.tvShows} Shows</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-4 mt-8">
              {watchlist.length > 0 && (
                <>
                  <NetflixButton
                    variant="play"
                    size="lg"
                    onClick={handlePlayRandom}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Play Random
                  </NetflixButton>
                  <NetflixButton
                    variant="secondary"
                    size="lg"
                    onClick={handleClearAll}
                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Clear All
                  </NetflixButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-12 pb-16">

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Start Building Your List</h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Discover amazing movies and TV shows, then add them to your list to watch later. 
                Your perfect entertainment awaits!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NetflixButton
                  variant="play"
                  size="lg"
                  onClick={() => window.location.href = '/movies'}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Film className="w-5 h-5 mr-2" />
                  Browse Movies
                </NetflixButton>
                <NetflixButton
                  variant="secondary"
                  size="lg"
                  onClick={() => window.location.href = '/tv-shows'}
                  className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  <Tv className="w-5 h-5 mr-2" />
                  Browse TV Shows
                </NetflixButton>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">
                  {filteredAndSortedWatchlist.length} {filteredAndSortedWatchlist.length === 1 ? 'item' : 'items'}
                </span>
                
                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <NetflixButton variant="ghost" className="text-white hover:bg-white/10">
                      <Filter className="w-4 h-4 mr-2" />
                      {filterType === 'all' ? 'All Content' : filterType === 'movie' ? 'Movies Only' : 'TV Shows Only'}
                    </NetflixButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-netflix-gray border-white/20">
                    <DropdownMenuItem onClick={() => setFilterType('all')} className="text-white hover:bg-white/10">
                      All Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('movie')} className="text-white hover:bg-white/10">
                      Movies Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('tv')} className="text-white hover:bg-white/10">
                      TV Shows Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <NetflixButton variant="ghost" className="text-white hover:bg-white/10">
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                      {sortBy === 'added' ? 'Recently Added' : sortBy === 'title' ? 'Alphabetical' : 'By Rating'}
                    </NetflixButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-netflix-gray border-white/20">
                    <DropdownMenuItem onClick={() => { setSortBy('added'); setSortOrder('desc'); }} className="text-white hover:bg-white/10">
                      <Clock className="w-4 h-4 mr-2" />
                      Recently Added
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }} className="text-white hover:bg-white/10">
                      <SortAsc className="w-4 h-4 mr-2" />
                      Title A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }} className="text-white hover:bg-white/10">
                      <SortDesc className="w-4 h-4 mr-2" />
                      Title Z-A
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('rating'); setSortOrder('desc'); }} className="text-white hover:bg-white/10">
                      <Award className="w-4 h-4 mr-2" />
                      Highest Rated
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                <NetflixButton
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${viewMode === 'grid' ? 'bg-white text-black' : 'text-white hover:bg-white/20'} rounded-md`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Grid
                </NetflixButton>
                <NetflixButton
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${viewMode === 'list' ? 'bg-white text-black' : 'text-white hover:bg-white/20'} rounded-md`}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </NetflixButton>
              </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAndSortedWatchlist.map((item) => (
                  <WatchlistItemCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedWatchlist.map((item) => (
                  <WatchlistItemRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyList;
