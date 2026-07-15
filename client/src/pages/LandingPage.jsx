import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Film, Tv, Flame, Clock } from 'lucide-react';
import HeroBanner from '../components/home/HeroBanner';
import MovieCarousel from '../components/home/MovieCarousel';
import { streamApi } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  // Fetch Banners
  const { data: bannersRes } = useQuery({
    queryKey: ['banners'],
    queryFn: () => streamApi.getBanners(),
  });

  // Fetch Movies
  const { data: moviesRes, refetch: refetchMovies } = useQuery({
    queryKey: ['movies-trending'],
    queryFn: () => streamApi.getMovies({ sort: 'trending' }),
  });

  const { data: topRatedRes } = useQuery({
    queryKey: ['movies-rating'],
    queryFn: () => streamApi.getMovies({ sort: 'rating' }),
  });

  // Fetch Series
  const { data: seriesRes, refetch: refetchSeries } = useQuery({
    queryKey: ['series-all'],
    queryFn: () => streamApi.getSeries(),
  });

  // Fetch Continue watching profile
  useEffect(() => {
    const loadContinueWatching = async () => {
      const res = await streamApi.getProfile();
      if (res.success && res.data?.continueWatching) {
        setContinueWatchingList(res.data.continueWatching);
      }
    };
    loadContinueWatching();
  }, [isAuthenticated]);

  const banners = bannersRes?.data || [];
  const trendingMovies = moviesRes?.data || [];
  const topRatedMovies = topRatedRes?.data || [];
  const originalSeries = seriesRes?.data || [];

  return (
    <div className="min-h-screen bg-stream-black pb-12 animate-fadeIn">
      {/* Hero Banner Section */}
      <HeroBanner banners={banners} />

      {/* Main Content Area */}
      <div className="relative z-30 -mt-16 sm:-mt-24 md:-mt-32 space-y-4 sm:space-y-6">
        {/* Continue Watching Row (If User Has History) */}
        {continueWatchingList.length > 0 && (
          <MovieCarousel
            title="Continue Watching"
            subtitle="Resume Instant 4K Playback"
            movies={continueWatchingList.map((item) => item.movie || item.series)}
            onWatchlistChange={() => {
              refetchMovies();
              refetchSeries();
            }}
          />
        )}

        {/* Top Trending 4K Movies */}
        <MovieCarousel
          title="Trending Now in 4K HDR"
          subtitle="Top #10 Worldwide"
          movies={trendingMovies}
          onWatchlistChange={() => refetchMovies()}
        />

        {/* StreamHUB Original Series */}
        <MovieCarousel
          title="StreamHUB Originals & Series"
          subtitle="Exclusive Seasons"
          movies={originalSeries}
          isSeries={true}
          onWatchlistChange={() => refetchSeries()}
        />

        {/* Critically Acclaimed / Top Rated */}
        <MovieCarousel
          title="Critically Acclaimed Cinema"
          subtitle="Dolby Atmos & Vision"
          movies={topRatedMovies}
          onWatchlistChange={() => refetchMovies()}
        />
      </div>
    </div>
  );
};

export default LandingPage;
