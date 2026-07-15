import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, Star, Clock, Sparkles, Share2, MessageSquare, Send, Film, User, Globe } from 'lucide-react';
import { streamApi } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import StreamPlayer from '../components/player/StreamPlayer';
import MovieCarousel from '../components/home/MovieCarousel';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [activePlayer, setActivePlayer] = useState(null); // 'video' | 'trailer' | null
  const [inWatchlist, setInWatchlist] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);

  const { data: movieRes, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => streamApi.getMovieById(id),
  });

  const movie = movieRes?.data;

  // Initialize watchlist & comments
  React.useEffect(() => {
    if (movie) {
      setLocalComments(movie.comments || []);
    }
  }, [movie]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stream-black pt-24 px-8 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-stream-red border-t-transparent rounded-full animate-spin glow-red" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-stream-black pt-32 text-center px-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await streamApi.toggleWatchlist(movie.id, null);
    if (res.success) setInWatchlist(res.inWatchlist);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    const res = await streamApi.addComment(movie.id, null, null, commentText.trim(), user);
    if (res.success && res.data) {
      setLocalComments([res.data, ...localComments]);
      setCommentText('');
    }
  };

  const resolveSubtitles = (item) => {
    if (!item) return [];
    if (item.subtitles && Array.isArray(item.subtitles)) return item.subtitles;
    if (item.subtitleUrl) {
      try {
        const parsed = JSON.parse(item.subtitleUrl);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [{ id: 1, label: 'Indonesian (CC)', language: 'Indonesian', fileUrl: item.subtitleUrl }];
      }
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-stream-black pb-24 selection:bg-stream-red selection:text-white">
      {/* StreamPlayer Overlay Modal if Active */}
      {activePlayer && (
        <div className="fixed inset-0 z-50 bg-black animate-fadeIn">
          <StreamPlayer
            url={activePlayer === 'video' ? movie.videoUrl : movie.trailerUrl}
            title={activePlayer === 'video' ? movie.title : `${movie.title} - Official 4K Trailer`}
            subtitleText={movie.resolution}
            contentId={movie.id}
            isSeries={false}
            subtitles={resolveSubtitles(movie)}
            onClose={() => setActivePlayer(null)}
          />
        </div>
      )}

      {/* Hero Backdrop Vignette */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        <img
          src={movie.banner || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stream-black via-stream-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stream-black via-stream-black/30 to-transparent" />

        {/* Content Details Overlay */}
        <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-stream-red/20 border border-stream-red/40 text-stream-red text-xs font-bold uppercase tracking-wider flex items-center space-x-1 glow-red-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{movie.resolution || '4K UHD HDR10+'}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                {movie.genre?.split(',')[0]}
              </span>
              {movie.duration && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-stream-gray-300 text-xs font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-stream-gray-400" />
                  <span>{movie.duration} Minutes</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.rating || '4.9'} / 5.0</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none font-display drop-shadow-xl">
              {movie.title}
            </h1>

            {/* Synopsis */}
            <p className="text-sm sm:text-base md:text-lg text-stream-gray-300 leading-relaxed line-clamp-4">
              {movie.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => setActivePlayer('video')}
                className="bg-stream-red hover:bg-stream-red-hover text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center space-x-3 shadow-2xl glow-red transition-all transform hover:scale-105"
              >
                <Play className="w-6 h-6 fill-white" />
                <span>Watch Movie (4K HDR)</span>
              </button>

              {movie.trailerUrl && (
                <button
                  onClick={() => setActivePlayer('trailer')}
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all"
                >
                  <Film className="w-5 h-5 text-stream-red" />
                  <span>Play Trailer</span>
                </button>
              )}

              <button
                onClick={handleWatchlist}
                className="bg-stream-dark/80 hover:bg-stream-card border border-white/15 text-white px-5 py-4 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all"
              >
                {inWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Specs & Comments Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Cast & Comments */}
        <div className="lg:col-span-2 space-y-10">
          {/* Cast & Crew Info */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight border-b border-white/10 pb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-stream-red" />
              <span>Cast & Production Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-bold text-stream-gray-400 uppercase tracking-wider block mb-1">Starring Cast</span>
                <p className="text-white font-medium">{movie.cast || 'Christopher Vance, Elena Rostova, Marcus Thorne'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-stream-gray-400 uppercase tracking-wider block mb-1">Director</span>
                <p className="text-white font-medium">{movie.director || 'Denis Villeneuve'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-stream-gray-400 uppercase tracking-wider block mb-1">Studio & Production</span>
                <p className="text-white font-medium">{movie.studio || 'StreamHUB Studios'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-stream-gray-400 uppercase tracking-wider block mb-1">Country & Language</span>
                <p className="text-white font-medium">{movie.country || 'USA'} • {movie.language || 'English (Dolby 7.1)'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Comments & Discussion */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-stream-red" />
                <span>Subscribers Reviews ({localComments.length})</span>
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? "Write a review or discussion about this movie..." : "Please log in to participate in discussion"}
                disabled={!isAuthenticated}
                className="flex-1 bg-stream-dark border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || !commentText.trim()}
                className="px-6 py-3 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {localComments.length === 0 ? (
                <p className="text-center text-xs text-stream-gray-400 py-6">
                  No reviews yet. Be the first subscriber to share your thoughts on this 4K release!
                </p>
              ) : (
                localComments.map((c) => (
                  <div key={c.id} className="p-4 bg-stream-dark rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
                          alt={c.user?.name}
                          className="w-8 h-8 rounded-full object-cover shadow"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{c.user?.name}</p>
                          <span className="text-[10px] text-stream-gray-400">@{c.user?.username}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-stream-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stream-gray-300 leading-relaxed pl-10">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Poster Box & Uploader Card */}
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl mb-4"
            />
            <button
              onClick={() => setActivePlayer('video')}
              className="w-full py-3.5 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg glow-red transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Instant Stream (4K)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Similar Movies Carousel */}
      {movie.similarMovies && movie.similarMovies.length > 0 && (
        <div className="mt-16">
          <MovieCarousel
            title="More Like This"
            subtitle="Recommended for You"
            movies={movie.similarMovies}
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
