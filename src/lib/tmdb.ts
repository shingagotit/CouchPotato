import { Movie, MovieResponse, TvShow, TvResponse, Genre } from '@/types/movie';

// Using the public TMDB API (requires no authentication for basic operations)
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// This is a demo key that works for development
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63';

export const tmdbService = {
  // Enhanced method to get comprehensive movie catalog with unlimited content and multi-language support
  async getAllMovies(page: number = 1, language: string = 'en-US'): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&language=${language}&sort_by=popularity.desc&include_adult=false&include_video=false&vote_count.gte=5&primary_release_date.gte=1980-01-01`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch all movies');
    }
    
    return response.json();
  },

  // Get movies from multiple pages at once for comprehensive catalog
  async getMoviesMultiPage(startPage: number = 1, endPage: number = 20): Promise<Movie[]> {
    const promises = [];
    for (let page = startPage; page <= endPage; page++) {
      promises.push(this.getAllMovies(page));
    }
    
    try {
      const responses = await Promise.all(promises);
      const allMovies: Movie[] = [];
      
      responses.forEach(response => {
        if (response.results) {
          allMovies.push(...response.results);
        }
      });
      
      // Remove duplicates based on ID
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      return uniqueMovies;
    } catch (error) {
      console.error('Error fetching multiple movie pages:', error);
      return [];
    }
  },

  // Enhanced method to get comprehensive TV catalog with unlimited content and multi-language support
  async getAllTvShows(page: number = 1, language: string = 'en-US'): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&page=${page}&language=${language}&sort_by=popularity.desc&include_adult=false&vote_count.gte=5&first_air_date.gte=1980-01-01`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch all TV shows');
    }
    
    return response.json();
  },

  // Get TV shows from multiple pages at once for comprehensive catalog
  async getTvShowsMultiPage(startPage: number = 1, endPage: number = 20): Promise<TvShow[]> {
    const promises = [];
    for (let page = startPage; page <= endPage; page++) {
      promises.push(this.getAllTvShows(page));
    }
    
    try {
      const responses = await Promise.all(promises);
      const allTvShows: TvShow[] = [];
      
      responses.forEach(response => {
        if (response.results) {
          allTvShows.push(...response.results);
        }
      });
      
      // Remove duplicates based on ID
      const uniqueTvShows = allTvShows.filter((show, index, self) => 
        index === self.findIndex(s => s.id === show.id)
      );
      
      return uniqueTvShows;
    } catch (error) {
      console.error('Error fetching multiple TV show pages:', error);
      return [];
    }
  },

  // Movies by genre
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=en-US&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies by genre');
    }
    
    return response.json();
  },

  // TV shows by genre
  async getTvShowsByGenre(genreId: number, page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=en-US&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TV shows by genre');
    }
    
    return response.json();
  },

  // Movies by year
  async getMoviesByYear(year: number, page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&primary_release_year=${year}&page=${page}&language=en-US&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies by year');
    }
    
    return response.json();
  },

  // TV shows by year
  async getTvShowsByYear(year: number, page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date_year=${year}&page=${page}&language=en-US&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TV shows by year');
    }
    
    return response.json();
  },

  // Get movie genres
  async getMovieGenres(): Promise<{ genres: Genre[] }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie genres');
    }
    
    return response.json();
  },

  // Get TV genres
  async getTvGenres(): Promise<{ genres: Genre[] }> {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TV genres');
    }
    
    return response.json();
  },

  // Now Playing Movies (currently in theaters)
  async getNowPlayingMovies(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch now playing movies');
    }
    
    return response.json();
  },

  // Upcoming Movies
  async getUpcomingMovies(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming movies');
    }
    
    return response.json();
  },

  // Airing Today TV Shows
  async getAiringTodayTvShows(page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch airing today TV shows');
    }
    
    return response.json();
  },

  // On the Air TV Shows  
  async getOnTheAirTvShows(page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch on the air TV shows');
    }
    
    return response.json();
  },

  async getPopularMovies(page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    
    return response.json();
  },

  async getTrendingMovies(): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending movies');
    }
    
    return response.json();
  },

  async getTopRatedMovies(): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch top rated movies');
    }
    
    return response.json();
  },

  async getMovieDetails(movieId: number): Promise<Movie> {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    
    return response.json();
  },

  async searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search movies');
    }
    
    return response.json();
  },

  // TV Show endpoints
  async getPopularTvShows(page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular TV shows');
    }
    
    return response.json();
  },

  async getTrendingTvShows(): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending TV shows');
    }
    
    return response.json();
  },

  async getTopRatedTvShows(): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch top rated TV shows');
    }
    
    return response.json();
  },

  async getTvShowDetails(tvId: number): Promise<TvShow> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TV show details');
    }
    
    return response.json();
  },

  async searchTvShows(query: string, page: number = 1): Promise<TvResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search TV shows');
    }
    
    return response.json();
  },

  // Get comprehensive content from all genres and languages for maximum coverage
  async getComprehensiveMovies(): Promise<Movie[]> {
    try {
      // Get all movie genres first
      const genresResponse = await this.getMovieGenres();
      const genres = genresResponse.genres;
      
      const allMovies: Movie[] = [];
      
      // Popular languages for international content
      const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'hi-IN', 'pt-BR'];
      
      // Fetch movies from each genre (first 2 pages per genre) for multiple languages
      const genrePromises = genres.slice(0, 15).map(async (genre) => {
        const languagePromises = languages.slice(0, 3).map(async (lang) => {
          try {
            const page1 = await this.getMoviesByGenre(genre.id, 1);
            const page2 = await this.getMoviesByGenre(genre.id, 2);
            return [...page1.results, ...page2.results];
          } catch (error) {
            console.warn(`Error fetching genre ${genre.id} for language ${lang}:`, error);
            return [];
          }
        });
        const results = await Promise.all(languagePromises);
        return results.flat();
      });
      
      const genreResults = await Promise.all(genrePromises);
      genreResults.forEach(movies => allMovies.push(...movies));
      
      // Also get popular, trending, and top-rated movies from multiple sources
      const [popular, trending, topRated, nowPlaying, upcoming] = await Promise.all([
        this.getMoviesMultiPage(1, 10), // Increased from 5 to 10 pages
        this.getTrendingMovies(),
        this.getTopRatedMovies(),
        this.getNowPlayingMovies(),
        this.getUpcomingMovies()
      ]);
      
      allMovies.push(...popular);
      allMovies.push(...trending.results);
      allMovies.push(...topRated.results);
      allMovies.push(...nowPlaying.results);
      allMovies.push(...upcoming.results);
      
      // Fetch additional international content
      const internationalPromises = languages.slice(0, 5).map(async (lang) => {
        try {
          const international = await this.getAllMovies(1, lang);
          return international.results;
        } catch (error) {
          console.warn(`Error fetching international movies for ${lang}:`, error);
          return [];
        }
      });
      
      const internationalResults = await Promise.all(internationalPromises);
      internationalResults.forEach(movies => allMovies.push(...movies));
      
      // Remove duplicates and return
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      return uniqueMovies.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      console.error('Error fetching comprehensive movies:', error);
      return [];
    }
  },

  // Get comprehensive TV shows from all genres and languages for maximum coverage
  async getComprehensiveTvShows(): Promise<TvShow[]> {
    try {
      // Get all TV genres first
      const genresResponse = await this.getTvGenres();
      const genres = genresResponse.genres;
      
      const allTvShows: TvShow[] = [];
      
      // Popular languages for international content
      const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'hi-IN', 'pt-BR'];
      
      // Fetch TV shows from each genre (first 2 pages per genre) for multiple languages
      const genrePromises = genres.slice(0, 15).map(async (genre) => {
        const languagePromises = languages.slice(0, 3).map(async (lang) => {
          try {
            const page1 = await this.getTvShowsByGenre(genre.id, 1);
            const page2 = await this.getTvShowsByGenre(genre.id, 2);
            return [...page1.results, ...page2.results];
          } catch (error) {
            console.warn(`Error fetching TV genre ${genre.id} for language ${lang}:`, error);
            return [];
          }
        });
        const results = await Promise.all(languagePromises);
        return results.flat();
      });
      
      const genreResults = await Promise.all(genrePromises);
      genreResults.forEach(shows => allTvShows.push(...shows));
      
      // Also get popular, trending, and top-rated TV shows from multiple sources
      const [popular, trending, topRated, airingToday, onTheAir] = await Promise.all([
        this.getTvShowsMultiPage(1, 10), // Increased from 5 to 10 pages
        this.getTrendingTvShows(),
        this.getTopRatedTvShows(),
        this.getAiringTodayTvShows(),
        this.getOnTheAirTvShows()
      ]);
      
      allTvShows.push(...popular);
      allTvShows.push(...trending.results);
      allTvShows.push(...topRated.results);
      allTvShows.push(...airingToday.results);
      allTvShows.push(...onTheAir.results);
      
      // Fetch additional international TV content
      const internationalPromises = languages.slice(0, 5).map(async (lang) => {
        try {
          const international = await this.getAllTvShows(1, lang);
          return international.results;
        } catch (error) {
          console.warn(`Error fetching international TV shows for ${lang}:`, error);
          return [];
        }
      });
      
      const internationalResults = await Promise.all(internationalPromises);
      internationalResults.forEach(shows => allTvShows.push(...shows));
      
      // Remove duplicates and return
      const uniqueTvShows = allTvShows.filter((show, index, self) => 
        index === self.findIndex(s => s.id === show.id)
      );
      
      return uniqueTvShows.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      console.error('Error fetching comprehensive TV shows:', error);
      return [];
    }
  },

  // Enhanced VidKing URL generator with better compatibility
  generateVidKingUrl(
    id: number, 
    mediaType: 'movie' | 'tv', 
    options: {
      season?: number;
      episode?: number;
      color?: string;
      autoPlay?: boolean;
      nextEpisode?: boolean;
      episodeSelector?: boolean;
      progress?: number;
      quality?: string;
    } = {}
  ): string {
    const baseUrl = 'https://www.vidking.net/embed';
    const { 
      season = 1, 
      episode = 1, 
      color = '8b5cf6', // Purple theme
      autoPlay = true, // Enable autoplay for better UX
      nextEpisode = true,
      episodeSelector = true,
      progress = 0,
      quality = 'auto'
    } = options;

    // Build URL based on media type
    let url = mediaType === 'movie' 
      ? `${baseUrl}/movie/${id}`
      : `${baseUrl}/tv/${id}/${season}/${episode}`;

    // Add query parameters for enhanced functionality
    const params = new URLSearchParams();
    if (color) params.append('color', color);
    if (autoPlay) params.append('autoPlay', 'true');
    if (nextEpisode && mediaType === 'tv') params.append('nextEpisode', 'true');
    if (episodeSelector && mediaType === 'tv') params.append('episodeSelector', 'true');
    if (progress > 0) params.append('progress', progress.toString());
    if (quality) params.append('quality', quality);
    
    // Add additional parameters for better streaming
    params.append('responsive', 'true');
    params.append('controls', 'true');
    params.append('preload', 'metadata');

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  },

  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  },

  getBackdropUrl(path: string, size: string = 'w1280'): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
};