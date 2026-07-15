import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Film, Tv, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { streamApi } from '../services/apiClient';
import MovieCard from '../components/common/MovieCard';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const initialQ = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialGenre = searchParams.get('genre') || 'all';

  const [queryText, setQueryText] = useState(initialQ);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedSort, setSelectedSort] = useState('trending');

  // Sync state with URL params when navigating from navbar
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQueryText(p.get('q') || '');
    if (p.get('type')) setSelectedType(p.get('type'));
    if (p.get('genre')) setSelectedGenre(p.get('genre'));
  }, [location.search]);

  // Fetch Genres
  const { data: genresRes } = useQuery({
    queryKey: ['genres'],
    queryFn: () => streamApi.getGenres(),
  });

  // Fetch Movies & Series
  const { data: moviesRes, isLoading: loadingMovies } = useQuery({
    queryKey: ['search-movies', queryText, selectedGenre, selectedSort],
    queryFn: () => streamApi.getMovies({ search: queryText, genre: selectedGenre === 'all' ? '' : selectedGenre, sort: selectedSort }),
  });

  const { data: seriesRes, isLoading: loadingSeries } = useQuery({
    queryKey: ['search-series', queryText, selectedGenre, selectedSort],
    queryFn: () => streamApi.getSeries({ search: queryText, genre: selectedGenre === 'all' ? '' : selectedGenre, sort: selectedSort }),
  });

  const genres = genresRes?.data || [
    { name: 'Action & Adventure' }, { name: 'Sci-Fi & Cyberpunk' }, { name: 'Dark Fantasy' },
    { name: 'Psychological Thriller' }, { name: 'Crime & Drama' }, { name: 'Anime & Animation' },
  ];

  let displayItems = [];
  const movies = moviesRes?.data || [];
  const series = seriesRes?.data || [];

  if (selectedType === 'movie') {
    displayItems = movies.map((m) => ({ ...m, isSeries: false }));
  } else if (selectedType === 'series') {
    displayItems = series.map((s) => ({ ...s, isSeries: true }));
  } else {
    displayItems = [
      ...movies.map((m) => ({ ...m, isSeries: false })),
      ...series.map((s) => ({ ...s, isSeries: true })),
    ];
  }

  const handleClearFilters = () => {
    setQueryText('');
    setSelectedType('all');
    setSelectedGenre('all');
    setSelectedSort('trending');
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-stream-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-stream-red selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Header & Main Search Bar */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">
            Explore 4K Library
          </h1>
          <p className="text-sm text-stream-gray-400">
            Search across movies, original series, and genres with instant live debouncing.
          </p>

          <div className="relative pt-2">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Type title, actor name, or keywords..."
              className="w-full bg-stream-dark border border-white/20 rounded-2xl py-4 pl-12 pr-10 text-base text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red shadow-2xl transition-all"
            />
            <Search className="w-5 h-5 text-stream-gray-400 absolute left-4 top-6" />
            {queryText && (
              <button
                onClick={() => setQueryText('')}
                className="absolute right-4 top-6 text-stream-gray-400 hover:text-white text-sm font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Multi-faceted Filtering Bar */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Content Type Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-stream-red text-white shadow-md glow-red-sm'
                  : 'bg-stream-dark text-stream-gray-400 hover:text-white'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setSelectedType('movie')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedType === 'movie'
                  ? 'bg-stream-red text-white shadow-md glow-red-sm'
                  : 'bg-stream-dark text-stream-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setSelectedType('series')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedType === 'series'
                  ? 'bg-stream-red text-white shadow-md glow-red-sm'
                  : 'bg-stream-dark text-stream-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Series</span>
            </button>
          </div>

          {/* Genre & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stream-gray-400 font-semibold hidden sm:inline">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-stream-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-stream-red"
              >
                <option value="all">All Genres</option>
                {genres.map((g, i) => (
                  <option key={i} value={g.name.split(',')[0]}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-stream-gray-400 font-semibold hidden sm:inline">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-stream-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-stream-red"
              >
                <option value="trending">Popularity & Views</option>
                <option value="newest">Newest Releases</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-stream-gray-300 hover:text-white text-xs font-medium flex items-center space-x-1 transition-colors"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stream-gray-400 font-medium px-1">
            <span>Showing <strong className="text-white font-bold">{displayItems.length}</strong> matching luxury titles</span>
            {queryText && <span>Query: "{queryText}"</span>}
          </div>

          {loadingMovies || loadingSeries ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-stream-red border-t-transparent rounded-full animate-spin glow-red" />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 max-w-xl mx-auto p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-stream-red/20 text-stream-red flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No exact matches found</h3>
              <p className="text-xs text-stream-gray-400 max-w-sm mx-auto">
                Try expanding your search parameters or select 'All Genres' and 'All Content' to explore other titles.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold text-xs shadow-lg glow-red-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6 pt-2">
              {displayItems.map((item) => (
                <div key={`${item.isSeries ? 's' : 'm'}-${item.id}`} className="flex justify-center">
                  <MovieCard movie={item} isSeries={item.isSeries} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
