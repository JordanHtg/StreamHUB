import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Sparkles } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const MovieCard = ({ movie, isSeries = false, progressPercentage = 0, onWatchlistChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  const handleCardClick = () => {
    if (isSeries) {
      navigate(`/series/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoadingWatchlist(true);
    const res = await streamApi.toggleWatchlist(isSeries ? null : movie.id, isSeries ? movie.id : null);
    if (res.success) {
      setInWatchlist(res.inWatchlist);
      if (onWatchlistChange) onWatchlistChange();
    }
    setLoadingWatchlist(false);
  };

  const primaryGenre = movie.genre?.split(',')[0] || 'Drama';

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex-none w-48 sm:w-56 md:w-64 rounded-2xl overflow-hidden bg-stream-card cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-30 shadow-lg hover:shadow-2xl border border-white/5 hover:border-white/20 select-none"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-stream-dark">
        <img
          src={movie.poster || movie.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* Quality Badge Top Left */}
        <div className="absolute top-2.5 left-2.5 bg-stream-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider text-white flex items-center space-x-1 shadow">
          <Sparkles className="w-2.5 h-2.5 text-stream-red" />
          <span>{movie.resolution || '4K HDR'}</span>
        </div>

        {/* Watchlist Quick Button Top Right */}
        <button
          onClick={handleWatchlistToggle}
          disabled={loadingWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-stream-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-stream-red hover:border-stream-red transition-colors shadow"
        >
          {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-stream-black via-stream-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-stream-red flex items-center justify-center text-white shadow-lg glow-red-sm transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Watch Now</span>
          </div>
        </div>

        {/* Continue Watching Progress Bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-stream-red shadow-sm transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 bg-stream-card">
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-stream-red transition-colors">
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-stream-gray-400 font-medium">
          <span className="truncate max-w-[110px]">{primaryGenre}</span>
          <div className="flex items-center space-x-2">
            {movie.duration && (
              <span className="flex items-center space-x-0.5">
                <Clock className="w-3 h-3 text-stream-gray-500" />
                <span>{movie.duration}m</span>
              </span>
            )}
            <span className="flex items-center space-x-0.5 text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating || '4.8'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
