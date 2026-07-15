import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, Sparkles, List, History, Settings, LogOut } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user, role, logout, isAuthenticated, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const [upgradedMsg, setUpgradedMsg] = React.useState('');

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['profile-full'],
    queryFn: () => streamApi.getProfile(),
    enabled: isAuthenticated,
  });

  const profileData = profileRes?.data || user;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stream-black pt-32 text-center px-4">
        <h2 className="text-2xl font-bold text-white">Please Sign In</h2>
        <Link to="/login" className="mt-4 inline-block px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold">
          Go to Login
        </Link>
      </div>
    );
  }

  const handleUpgrade = (months) => {
    upgradeToPremium(months);
    setUpgradedMsg(`✨ Berhasil Upgrade ke Member Premium (${months} Bulan)! Selamat menikmati akses 4K UHD tanpa batas.`);
    setTimeout(() => setUpgradedMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-stream-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 selection:bg-stream-red selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Profile Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stream-red/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={profileData?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
              alt={profileData?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-stream-red/30 shadow-2xl flex-shrink-0"
            />

            <div className="flex-1 text-center sm:text-left space-y-2 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                    {profileData?.name}
                  </h1>
                  <p className="text-xs text-stream-gray-400">@{profileData?.username || 'streamhub_user'}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-stream-red/20 border border-stream-red/40 text-stream-red text-xs font-bold uppercase tracking-wider self-center sm:self-start flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{role}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-stream-gray-300">
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-stream-red" />
                  <span>{profileData?.email}</span>
                </span>
                {profileData?.phone && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-stream-gray-400" />
                    <span>{profileData.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {upgradedMsg && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm font-bold flex items-center space-x-3 shadow-lg animate-fadeIn">
            <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-400 animate-spin" />
            <span>{upgradedMsg}</span>
          </div>
        )}

        {/* Membership Tier & VIP Upgrade Portal */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <Shield className="w-5 h-5 text-stream-red" />
                <span>StreamHUB 4-Tier Membership System</span>
              </h3>
              <p className="text-xs text-stream-gray-400 mt-0.5">
                Kelola status keanggotaan atau pilih paket VIP Anda
              </p>
            </div>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-stream-gray-300">
              Active Tier: <strong className="text-white">{role}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border transition-all ${role === 'Guest' ? 'bg-white/10 border-white/30' : 'bg-stream-dark/60 border-white/5 opacity-60'}`}>
              <p className="font-bold text-white">1. Guest (Belum Daftar)</p>
              <p className="text-stream-gray-400 mt-1">Akses katalog preview & jelajah informasi film gratis tanpa registrasi.</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${role === 'Member Basic' ? 'bg-blue-500/20 border-blue-500/40' : 'bg-stream-dark/60 border-white/5 opacity-60'}`}>
              <p className="font-bold text-blue-400">2. Member Basic (Sudah Daftar)</p>
              <p className="text-stream-gray-400 mt-1">Akun yang baru daftar via Email atau Continue with Google. Streaming resolusi standar dan watchlist lokal.</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${role === 'Member Premium' ? 'bg-amber-500/20 border-amber-500/40' : 'bg-stream-dark/60 border-white/5 opacity-60'}`}>
              <p className="font-bold text-amber-400">3. Member Premium (Langganan VIP)</p>
              <p className="text-stream-gray-400 mt-1">Akses 4K UHD Dolby Vision highest quality & bebas iklan selama 1, 2, atau 3 Bulan.</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${role === 'Uploader' ? 'bg-stream-red/20 border-stream-red/40' : 'bg-stream-dark/60 border-white/5 opacity-60'}`}>
              <p className="font-bold text-stream-red">4. Uploader (Developer Studio)</p>
              <p className="text-stream-gray-400 mt-1">Hak akses penuh eksklusif ke Uploader Portal, upload video lokal/URL, edit & hapus.</p>
            </div>
          </div>

          {/* Upgrade Buttons for Basic Members */}
          {role !== 'Uploader' && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                ⚡ Upgrade ke Member Premium Sekarang:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleUpgrade(1)}
                  className="p-3.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 rounded-2xl text-left transition-all group"
                >
                  <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">Langganan 1 Bulan</p>
                  <p className="text-sm font-black text-white mt-0.5">Rp 49.000</p>
                  <span className="text-[10px] text-stream-gray-400 block mt-1">Akses 4K UHD (30 Hari)</span>
                </button>

                <button
                  onClick={() => handleUpgrade(2)}
                  className="p-3.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 rounded-2xl text-left transition-all group relative overflow-hidden"
                >
                  <span className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-stream-black text-[9px] font-black rounded-bl">HEMAT 10%</span>
                  <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">Langganan 2 Bulan</p>
                  <p className="text-sm font-black text-white mt-0.5">Rp 89.000</p>
                  <span className="text-[10px] text-stream-gray-400 block mt-1">Akses 4K UHD (60 Hari)</span>
                </button>

                <button
                  onClick={() => handleUpgrade(3)}
                  className="p-3.5 bg-gradient-to-r from-stream-red/20 to-amber-500/20 hover:from-stream-red/30 hover:to-amber-500/30 border border-stream-red/50 rounded-2xl text-left transition-all group relative overflow-hidden ring-1 ring-stream-red/40"
                >
                  <span className="absolute top-0 right-0 px-2 py-0.5 bg-stream-red text-white text-[9px] font-black rounded-bl">BEST VALUE</span>
                  <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Langganan 3 Bulan</p>
                  <p className="text-sm font-black text-white mt-0.5">Rp 119.000</p>
                  <span className="text-[10px] text-stream-gray-400 block mt-1">Akses 4K UHD (90 Hari)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/watchlist"
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-stream-red flex items-center space-x-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-stream-red/20 text-stream-red flex items-center justify-center">
              <List className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{profileData?.stats?.watchlistCount || 2}</p>
              <span className="text-xs text-stream-gray-400">Watchlist Items</span>
            </div>
          </Link>

          <Link
            to="/history"
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-stream-red flex items-center space-x-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{profileData?.stats?.continueWatchingCount || 1}</p>
              <span className="text-xs text-stream-gray-400">Active Sessions</span>
            </div>
          </Link>

          <Link
            to="/settings"
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-stream-red flex items-center space-x-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">{role}</p>
              <span className="text-xs text-stream-gray-400">Current Plan Status</span>
            </div>
          </Link>
        </div>

        {/* Account Details & Quick Actions */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight border-b border-white/10 pb-3">
            Account Management & Preferences
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-stream-gray-400">Default Streaming Quality</span>
              <span className="text-white font-bold">
                {role === 'Member Premium' || role === 'Uploader' ? '4K UHD Dolby Vision / HDR10+' : '1080p Full HD Standard'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-stream-gray-400">Audio Language & Subtitles</span>
              <span className="text-white font-bold">English (Original) / Indonesian Sub</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-stream-gray-400">Enterprise CDN Node</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Asia-Pacific (Latency: 12ms)</span>
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/settings"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Account Settings</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-6 py-3 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of StreamHUB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
