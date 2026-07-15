import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, ShieldCheck, Heart, Sparkles, Globe, Tv, Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-t from-stream-black via-stream-dark to-stream-black border-t border-white/10 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-stream-red flex items-center justify-center shadow-lg glow-red-sm">
                <PlayCircle className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white font-display">
                Stream<span className="text-stream-red">HUB</span>
              </span>
            </Link>
            <p className="text-sm text-stream-gray-400 max-w-sm leading-relaxed">
              Experience cinema redefined. StreamHUB is an ultra-modern luxury streaming portal offering 4K UHD movies, exclusive original series, and instant high-definition entertainment.
            </p>
            <div className="flex items-center space-x-2 text-xs text-stream-gray-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Grade Security & High Performance CDN</span>
            </div>
          </div>

          {/* Browse Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2 text-sm text-stream-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link to="/search?type=movie" className="hover:text-white transition-colors">4K Movies</Link></li>
              <li><Link to="/search?type=series" className="hover:text-white transition-colors">Original Series</Link></li>
              <li><Link to="/search?genre=all" className="hover:text-white transition-colors">Browse Genres</Link></li>
              <li><Link to="/watchlist" className="hover:text-white transition-colors">My Watchlist</Link></li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Top Categories</h4>
            <ul className="space-y-2 text-sm text-stream-gray-400">
              <li><Link to="/search?genre=Action" className="hover:text-white transition-colors">Action & Adventure</Link></li>
              <li><Link to="/search?genre=Sci-Fi" className="hover:text-white transition-colors">Sci-Fi & Cyberpunk</Link></li>
              <li><Link to="/search?genre=Fantasy" className="hover:text-white transition-colors">Dark Fantasy</Link></li>
              <li><Link to="/search?genre=Anime" className="hover:text-white transition-colors">Anime & Animation</Link></li>
              <li><Link to="/search?genre=Thriller" className="hover:text-white transition-colors">Psychological Thriller</Link></li>
            </ul>
          </div>

          {/* Account Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">StreamHUB Roles</h4>
            <ul className="space-y-2 text-sm text-stream-gray-400">
              <li><Link to="/login" className="hover:text-white transition-colors">Subscriber Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Free Account</Link></li>
              <li><Link to="/uploader/dashboard" className="hover:text-stream-red font-semibold transition-colors flex items-center space-x-1"><Sparkles className="w-3.5 h-3.5 text-stream-red" /><span>Uploader Portal</span></Link></li>
              <li><Link to="/forgot-password" className="hover:text-white transition-colors">Forgot Password / OTP</Link></li>
              <li><Link to="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stream-gray-500 gap-4">
          <p>© {new Date().getFullYear()} StreamHUB Inc. All rights reserved. Watch Anywhere. Anytime.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1"><Globe className="w-3.5 h-3.5" /><span>English (US)</span></span>
            <span className="hover:text-stream-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stream-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stream-gray-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
