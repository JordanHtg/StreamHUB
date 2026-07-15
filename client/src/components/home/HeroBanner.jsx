import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const HeroBanner = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const activeBanner = banners[currentIndex] || {
    id: 1,
    title: 'AETHELGARD: THE OBSIDIAN CROWN',
    subtitle: 'StreamHUB Original • 4K HDR10+ • #1 Trending in Dark Fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    targetId: 1,
    targetType: 'movie',
  };

  // Auto slide interval every 7 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePlayNow = () => {
    if (activeBanner.targetType === 'series') {
      navigate(`/series/${activeBanner.targetId}`);
    } else {
      navigate(`/movie/${activeBanner.targetId}`);
    }
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const res = await streamApi.toggleWatchlist(
      activeBanner.targetType === 'movie' ? activeBanner.targetId : null,
      activeBanner.targetType === 'series' ? activeBanner.targetId : null
    );
    if (res.success) setInWatchlist(res.inWatchlist);
  };

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-stream-black select-none">
      {/* Background Image / Backdrop */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover object-center transform scale-105 animate-float"
          />
          {/* Gradients for luxury depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-stream-black via-stream-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stream-black via-transparent to-stream-black/50" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-2xl space-y-4 animate-fadeIn">
          {/* Quality & Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stream-red/20 border border-stream-red/40 text-stream-red text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg glow-red-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{activeBanner.subtitle || 'StreamHUB Original • 4K UHD'}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none font-display drop-shadow-2xl">
            {activeBanner.title}
          </h1>

          {/* Description / Synopsis */}
          <p className="text-sm sm:text-base md:text-lg text-stream-gray-300 line-clamp-3 leading-relaxed drop-shadow-md">
            In a fractured kingdom powered by ancient runic crystal technology, an exiled knight must unite the warring noble houses before an eclipse unleashes an immortal shadow army. Experience cinema in true 4K HDR.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={handlePlayNow}
              className="bg-stream-red hover:bg-stream-red-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center space-x-3 shadow-2xl glow-red transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={handleWatchlist}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-lg border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center space-x-2.5 transition-all transform hover:scale-105"
            >
              {inWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={handlePlayNow}
              className="bg-stream-dark/80 hover:bg-stream-card border border-white/10 text-stream-gray-300 hover:text-white px-5 py-3.5 rounded-xl font-medium text-sm flex items-center space-x-2 transition-all"
            >
              <Info className="w-4 h-4" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators & Mute Switch at Bottom Right */}
      <div className="absolute right-6 bottom-24 z-20 hidden md:flex items-center space-x-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full bg-stream-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-stream-red transition-colors shadow-lg"
          title={isMuted ? 'Unmute preview sound' : 'Mute preview sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-2 bg-stream-black/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-stream-red glow-red-sm' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
