import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User as UserIcon, LogOut, Film, Tv, List, History, Settings, ShieldCheck, Sparkles, PlayCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { streamApi } from '../../services/apiClient';

const Navbar = () => {
  const { user, role, logout, isAuthenticated, mockMode, toggleMockMode } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live Instant Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await streamApi.getMovies({ search: searchQuery });
      if (res.success && res.data) {
        setSearchResults(res.data.slice(0, 5));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notificationsList = [
    { id: 1, title: 'New Release in 4K HDR', time: '2h ago', desc: 'AETHELGARD: The Obsidian Crown is now streaming.' },
    { id: 2, title: 'Episode 4 Live', time: '5h ago', desc: 'Quantum Singularity S1:E4 "Singularity Zero" added.' },
    { id: 3, title: 'Watchlist Update', time: '1d ago', desc: 'CYBER-NEXUS 2088 received Dolby Vision remaster.' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav py-3.5 shadow-2xl' : 'bg-gradient-to-b from-stream-black/95 via-stream-black/60 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand & Main Links */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-stream-red flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 glow-red-sm">
              <PlayCircle className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-display">
              Stream<span className="text-stream-red">HUB</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stream-gray-300">
            <Link
              to="/"
              className={`hover:text-white transition-colors flex items-center space-x-1.5 py-1 ${
                location.pathname === '/' ? 'text-white font-semibold border-b-2 border-stream-red' : ''
              }`}
            >
              <span>Home</span>
            </Link>
            <Link
              to="/search?type=movie"
              className={`hover:text-white transition-colors flex items-center space-x-1.5 py-1 ${
                location.pathname.includes('/search') && location.search.includes('movie') ? 'text-white font-semibold border-b-2 border-stream-red' : ''
              }`}
            >
              <Film className="w-4 h-4 text-stream-red" />
              <span>Movies</span>
            </Link>
            <Link
              to="/search?type=series"
              className={`hover:text-white transition-colors flex items-center space-x-1.5 py-1 ${
                location.pathname.includes('/search') && location.search.includes('series') ? 'text-white font-semibold border-b-2 border-stream-red' : ''
              }`}
            >
              <Tv className="w-4 h-4 text-stream-red" />
              <span>Series</span>
            </Link>
            <Link
              to="/search?genre=all"
              className="hover:text-white transition-colors py-1"
            >
              <span>Genres</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/watchlist"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 py-1 ${
                    location.pathname === '/watchlist' ? 'text-white font-semibold border-b-2 border-stream-red' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>My List</span>
                </Link>
                <Link
                  to="/history"
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 py-1 ${
                    location.pathname === '/history' ? 'text-white font-semibold border-b-2 border-stream-red' : ''
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>
              </>
            )}
            {role === 'Uploader' && (
              <Link
                to="/uploader/dashboard"
                className="bg-stream-red/20 text-stream-red border border-stream-red/40 px-3 py-1 rounded-full text-xs font-bold hover:bg-stream-red hover:text-white transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Uploader Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side: Search, Mode Toggle, Notifications & Profile */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          {/* Live Search Bar / Icon */}
          <div className="relative">
            {showSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 4K movies, series, cast..."
                    autoFocus
                    className="w-64 sm:w-80 bg-stream-dark border border-white/20 rounded-full py-1.5 pl-10 pr-8 text-sm text-white placeholder-stream-gray-400 focus:outline-none focus:border-stream-red shadow-inner transition-all"
                  />
                  <Search className="w-4 h-4 text-stream-gray-400 absolute left-3.5 top-2.5" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stream-gray-400 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="ml-2 text-xs text-stream-gray-400 hover:text-white font-medium"
                >
                  Cancel
                </button>

                {/* Instant Live Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-11 right-0 left-0 sm:w-80 bg-stream-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-2">
                    <div className="px-3 py-1 text-[10px] font-semibold text-stream-gray-400 uppercase tracking-wider">
                      Instant Search Matches
                    </div>
                    {searchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                          navigate(`/movie/${m.id}`);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-md shadow" />
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1">{m.title}</p>
                          <span className="text-[11px] text-stream-gray-400">{m.genre.split(',')[0]} • {m.resolution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-stream-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Realtime API / Mock Engine Toggle */}
          <button
            onClick={toggleMockMode}
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              !mockMode
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30 shadow-sm'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
            }`}
            title="Toggle between Realtime Express+Prisma Database API and Local Mock Engine"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!mockMode ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{!mockMode ? '⚡ Realtime Live API ON' : '🛠️ Offline Mock Engine'}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-stream-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-stream-red rounded-full ring-2 ring-stream-black animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-stream-red rounded-full ring-2 ring-stream-black" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-stream-card border border-white/10 rounded-2xl shadow-2xl py-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-white/10">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <span className="text-[11px] text-stream-red font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {notificationsList.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <span className="text-[10px] text-stream-gray-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-stream-gray-300 mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Auth Section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 focus:outline-none group"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
                  alt={user?.name || 'User Avatar'}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-stream-red transition-all shadow-md"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-white max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-stream-card border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-stream-gray-400 truncate">{user?.email}</p>
                    <div className="mt-1.5 flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 bg-stream-red/20 text-stream-red rounded text-[10px] font-bold uppercase tracking-wider">
                        {role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-xs text-stream-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-stream-gray-400" />
                      <span>Profile Account</span>
                    </Link>
                    <Link
                      to="/watchlist"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-xs text-stream-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <List className="w-4 h-4 text-stream-gray-400" />
                      <span>My Watchlist</span>
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-xs text-stream-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <History className="w-4 h-4 text-stream-gray-400" />
                      <span>Watch History</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-xs text-stream-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-stream-gray-400" />
                      <span>Settings</span>
                    </Link>

                    {role === 'Uploader' && (
                      <Link
                        to="/uploader/dashboard"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-xs text-stream-red hover:bg-stream-red/10 transition-colors font-semibold border-t border-white/5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Uploader Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-stream-red hover:bg-white/5 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-stream-gray-300 hover:text-white transition-colors py-1.5 px-3"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-stream-red hover:bg-stream-red-hover text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg glow-red-sm transition-all transform hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stream-gray-300 hover:text-white rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stream-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-4 space-y-3 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-white hover:text-stream-red"
          >
            Home
          </Link>
          <Link
            to="/search?type=movie"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stream-gray-300 hover:text-white"
          >
            Movies
          </Link>
          <Link
            to="/search?type=series"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stream-gray-300 hover:text-white"
          >
            Series
          </Link>
          <Link
            to="/search?genre=all"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-stream-gray-300 hover:text-white"
          >
            Genres
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-stream-gray-300 hover:text-white"
              >
                My Watchlist
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-stream-gray-300 hover:text-white"
              >
                Watch History
              </Link>
              {role === 'Uploader' && (
                <Link
                  to="/uploader/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-stream-red"
                >
                  Uploader Dashboard
                </Link>
              )}
            </>
          )}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-stream-gray-400">Hybrid Mock Mode</span>
            <button
              onClick={toggleMockMode}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                mockMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-stream-gray-300'
              }`}
            >
              {mockMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
