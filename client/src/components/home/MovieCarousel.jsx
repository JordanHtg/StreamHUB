import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import MovieCard from '../common/MovieCard';

const MovieCarousel = ({ title, subtitle, movies = [], isSeries = false, onWatchlistChange }) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">
                {title}
              </h2>
              {subtitle && (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-stream-red/15 text-stream-red text-xs font-bold uppercase tracking-wider">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Scroll Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-9 h-9 rounded-full bg-stream-dark border border-white/10 hover:border-stream-red flex items-center justify-center text-stream-gray-300 hover:text-white hover:bg-stream-red transition-all shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full bg-stream-dark border border-white/10 hover:border-stream-red flex items-center justify-center text-stream-gray-300 hover:text-white hover:bg-stream-red transition-all shadow-md"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar scroll-smooth py-4 px-1"
        >
          {movies.map((item) => (
            <MovieCard
              key={item.id}
              movie={item}
              isSeries={isSeries}
              progressPercentage={item.progressPercentage || 0}
              onWatchlistChange={onWatchlistChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieCarousel;
