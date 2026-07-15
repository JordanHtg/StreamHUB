import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Bell, Monitor, Lock, Save, CheckCircle, User } from 'lucide-react';

const SettingsPage = () => {
  const { user, isAuthenticated, mockMode, toggleMockMode, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80');
  const [avatarMode, setAvatarMode] = useState('url'); // 'url' | 'local'
  const [quality, setQuality] = useState('4K UHD HDR10+');
  const [notifyNewReleases, setNotifyNewReleases] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLocalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({ name, avatar });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stream-black pt-32 text-center text-white">
        <h2>Please sign in to view your settings.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stream-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-stream-red selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center space-x-3.5 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-stream-red/20 text-stream-red flex items-center justify-center shadow-lg glow-red-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Account Settings & Preferences
            </h1>
            <p className="text-xs text-stream-gray-400">
              Customize your luxury streaming playback quality, notifications, and profile details.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Settings successfully saved across your StreamHUB account!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <User className="w-4 h-4 text-stream-red" />
                <span>Profile Information</span>
              </h3>
              <div className="flex items-center space-x-3">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'}
                  alt={name}
                  className="w-10 h-10 rounded-full object-cover border border-stream-red shadow"
                />
                <span className="text-xs text-stream-gray-400">Live Preview</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider">
                    Avatar Image Mode
                  </label>
                  <div className="space-x-1">
                    <button
                      type="button"
                      onClick={() => setAvatarMode('url')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        avatarMode === 'url' ? 'bg-stream-red text-white' : 'bg-white/10 text-stream-gray-400 hover:text-white'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('local')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        avatarMode === 'local' ? 'bg-stream-red text-white' : 'bg-white/10 text-stream-gray-400 hover:text-white'
                      }`}
                    >
                      Local File
                    </button>
                  </div>
                </div>

                {avatarMode === 'url' ? (
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalFileChange}
                    className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2 text-xs text-stream-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stream-red file:text-white hover:file:bg-stream-red-hover transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Playback & Streaming Preferences */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2 border-b border-white/10 pb-3">
              <Monitor className="w-4 h-4 text-stream-red" />
              <span>Playback Quality & Engine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1.5">
                  Default Streaming Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red"
                >
                  <option value="4K UHD HDR10+">4K UHD HDR10+ (Highest Quality)</option>
                  <option value="4K UHD Dolby Vision">4K UHD Dolby Vision</option>
                  <option value="1080p FHD">1080p FHD (Data Saver)</option>
                  <option value="Auto">Auto (Adjusts to Network Speed)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex items-center justify-between p-3 bg-stream-dark rounded-xl border border-white/10">
                  <span className="text-xs text-stream-gray-300">Hybrid Offline Engine</span>
                  <button
                    type="button"
                    onClick={toggleMockMode}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      mockMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/10 text-stream-gray-400'
                    }`}
                  >
                    {mockMode ? 'Enabled (ON)' : 'Live API Only'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-2xl shadow-lg glow-red flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
