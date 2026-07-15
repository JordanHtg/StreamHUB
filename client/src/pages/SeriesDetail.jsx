import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Check, Star, Sparkles, Tv, Clock, Film, List } from 'lucide-react';
import { streamApi } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import StreamPlayer from '../components/player/StreamPlayer';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeEpisode, setActiveEpisode] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  const { data: seriesRes, isLoading } = useQuery({
    queryKey: ['series', id],
    queryFn: () => streamApi.getSeriesById(id),
  });

  const series = seriesRes || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stream-black pt-24 px-8 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-stream-red border-t-transparent rounded-full animate-spin glow-red" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-stream-black pt-32 text-center px-4">
        <h2 className="text-2xl font-bold text-white">Series Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  const episodes = series.episodes || [];
  const seasonEpisodes = episodes.filter((ep) => ep.seasonNumber === selectedSeason);

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await streamApi.toggleWatchlist(null, series.id);
    if (res.success) setInWatchlist(res.inWatchlist);
  };

  const handleEpisodePlay = (ep) => {
    setActiveEpisode(ep);
  };

  // Find next episode
  const getNextEpisode = (currentEp) => {
    const idx = episodes.findIndex((x) => x.id === currentEp?.id);
    if (idx !== -1 && idx + 1 < episodes.length) {
      return episodes[idx + 1];
    }
    return null;
  };

  const getPrevEpisode = (currentEp) => {
    const idx = episodes.findIndex((x) => x.id === currentEp?.id);
    if (idx > 0) {
      return episodes[idx - 1];
    }
    return null;
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
      {/* StreamPlayer Modal for Episode */}
      {activeEpisode && (
        <div className="fixed inset-0 z-50 bg-black animate-fadeIn">
          <StreamPlayer
            url={activeEpisode.videoUrl}
            title={`${series.title} — S${activeEpisode.seasonNumber}:E${activeEpisode.episodeNumber} "${activeEpisode.title}"`}
            subtitleText={series.genre}
            contentId={series.id}
            isSeries={true}
            episodeId={activeEpisode.id}
            subtitles={resolveSubtitles(activeEpisode)}
            nextEpisode={getNextEpisode(activeEpisode)}
            prevEpisode={getPrevEpisode(activeEpisode)}
            onNextEpisode={(nextEp) => setActiveEpisode(nextEp)}
            onPrevEpisode={(prevEp) => setActiveEpisode(prevEp)}
            onClose={() => setActiveEpisode(null)}
          />
        </div>
      )}

      {/* Backdrop Hero */}
      <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
        <img
          src={series.banner || series.poster}
          alt={series.title}
          className="w-full h-full object-cover object-center transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stream-black via-stream-black/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stream-black via-stream-black/30 to-transparent" />

        <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">
          <div className="max-w-3xl space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-stream-red/20 border border-stream-red/40 text-stream-red text-xs font-bold uppercase tracking-wider flex items-center space-x-1 glow-red-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>StreamHUB Original Series</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                {series.genre?.split(',')[0]}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{series.rating || '4.9'} / 5.0</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none font-display drop-shadow-xl">
              {series.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-stream-gray-300 leading-relaxed line-clamp-3">
              {series.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              {episodes.length > 0 && (
                <button
                  onClick={() => handleEpisodePlay(episodes[0])}
                  className="bg-stream-red hover:bg-stream-red-hover text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center space-x-3 shadow-2xl glow-red transition-all transform hover:scale-105"
                >
                  <Play className="w-6 h-6 fill-white" />
                  <span>Play Season 1 Episode 1</span>
                </button>
              )}

              <button
                onClick={handleWatchlist}
                className="bg-stream-dark/80 hover:bg-stream-card border border-white/15 text-white px-6 py-4 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all"
              >
                {inWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center space-x-3">
            <Tv className="w-6 h-6 text-stream-red" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Episodes & Seasons</h2>
          </div>

          {/* Season Switcher */}
          <div className="flex items-center space-x-2">
            {[1, 2].map((sNum) => (
              <button
                key={sNum}
                onClick={() => setSelectedSeason(sNum)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSeason === sNum
                    ? 'bg-stream-red text-white shadow-md glow-red-sm'
                    : 'bg-stream-dark text-stream-gray-400 hover:text-white'
                }`}
              >
                Season {sNum}
              </button>
            ))}
          </div>
        </div>

        {/* Episode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasonEpisodes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stream-gray-400 text-sm">
              No episodes available right now for Season {selectedSeason}. Check back soon!
            </div>
          ) : (
            seasonEpisodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => handleEpisodePlay(ep)}
                className="group glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 cursor-pointer hover:border-stream-red/50 transition-all"
              >
                {/* Episode Thumbnail */}
                <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-stream-dark">
                  <img
                    src={ep.thumbnailUrl || series.banner}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-stream-red/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                    {ep.duration}m
                  </span>
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-stream-red uppercase tracking-wider">
                      Episode {ep.episodeNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-stream-red transition-colors line-clamp-1">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-stream-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {ep.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
