import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { History, Play, Clock, Sparkles, Trash2 } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import MovieCard from '../../components/common/MovieCard';

const HistoryPage = () => {
  const { isAuthenticated } = useAuth();

  const { data: profileRes, isLoading, refetch } = useQuery({
    queryKey: ['profile-history'],
    queryFn: () => streamApi.getProfile(),
    enabled: isAuthenticated,
  });

  const historyItems = profileRes?.data?.continueWatching || [];

  return (
    <div className="min-h-screen bg-stream-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-stream-red selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-stream-red/20 text-stream-red flex items-center justify-center shadow-lg glow-red-sm">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                Watch History & Progress
              </h1>
              <p className="text-xs text-stream-gray-400">
                Continue watching movies and series exactly where you left off across all devices.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold">
            {historyItems.length} Active Sessions
          </span>
        </div>

        {/* History Grid */}
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-stream-red border-t-transparent rounded-full animate-spin glow-red" />
          </div>
        ) : !isAuthenticated ? (
          <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 max-w-xl mx-auto p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Sign In Required</h3>
            <p className="text-xs text-stream-gray-400">Please log in to your account to view your watch history and progress.</p>
            <Link to="/login" className="inline-block px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold text-xs shadow-lg">
              Sign In Now
            </Link>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl border border-white/10 max-w-xl mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-stream-gray-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Watch History Yet</h3>
            <p className="text-xs text-stream-gray-400 max-w-sm mx-auto">
              Once you start streaming any 4K movie or series, your progress and timestamps will automatically sync and display here.
            </p>
            <Link to="/" className="inline-block px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold text-xs shadow-lg glow-red-sm">
              Start Watching
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
            {historyItems.map((item) => {
              const content = item.movie || item.series;
              if (!content) return null;
              return (
                <div key={item.id} className="flex justify-center">
                  <MovieCard
                    movie={content}
                    isSeries={!!item.seriesId}
                    progressPercentage={item.progressPercentage || 40}
                    onWatchlistChange={() => refetch()}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
