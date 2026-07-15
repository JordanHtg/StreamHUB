import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Film, Tv, TrendingUp, DollarSign, Eye, Heart, BarChart3, Clock, Trash2, Edit } from 'lucide-react';
import { streamApi } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import UploadContentModal from '../../components/uploader/UploadContentModal';

const UploaderDashboard = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState({ isEpisode: false, seriesId: null, editItem: null, isSeries: false });
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'series'

  const { data: statsRes, isLoading, refetch } = useQuery({
    queryKey: ['uploader-stats'],
    queryFn: () => streamApi.getUploaderStatistics(),
    enabled: isAuthenticated && role === 'Uploader',
  });

  if (!isAuthenticated || role !== 'Uploader') {
    return (
      <div className="min-h-screen bg-stream-black pt-32 text-center px-4 space-y-4">
        <h2 className="text-2xl font-bold text-white">Access Denied: Uploader Studio Only</h2>
        <p className="text-xs text-stream-gray-400">You need an Uploader role or enterprise studio credentials to access the analytics portal.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-stream-red text-white rounded-xl font-bold text-xs">
          Sign In as Uploader
        </Link>
      </div>
    );
  }

  const stats = statsRes?.statistics || {
    totalMovies: 5,
    totalSeries: 2,
    totalViews: 324500,
    totalLikes: 113000,
    activeWatchers: 2480,
    estimatedRevenue: '$4,056.25',
  };

  const chartData = statsRes?.chartData || [
    { month: 'Jan', views: 24000, revenue: 300 },
    { month: 'Feb', views: 42000, revenue: 525 },
    { month: 'Mar', views: 68000, revenue: 850 },
    { month: 'Apr', views: 95000, revenue: 1187 },
    { month: 'May', views: 142000, revenue: 1775 },
    { month: 'Jun', views: 198000, revenue: 2475 },
  ];

  const movies = statsRes?.recentContent?.movies || [];
  const series = statsRes?.recentContent?.series || [];

  const handleOpenNewTitle = () => {
    setModalMode({ isEpisode: false, seriesId: null, editItem: null, isSeries: false });
    setIsModalOpen(true);
  };

  const handleOpenAddEpisode = (sId) => {
    setModalMode({ isEpisode: true, seriesId: sId, editItem: null, isSeries: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, isSeries = false) => {
    setModalMode({ isEpisode: false, seriesId: null, editItem: item, isSeries });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id, title, isSeries = false) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from StreamHUB?`)) {
      if (isSeries) {
        await streamApi.deleteSeries(id);
      } else {
        await streamApi.deleteMovie(id);
      }
      refetch();
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm('Are you sure you want to restore the initial luxury demo catalog? This will bring back default demo movies and series.')) {
      streamApi.resetCatalogToDefault();
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-stream-black pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-stream-red selection:text-white">
      <UploadContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        isEpisode={modalMode.isEpisode}
        seriesId={modalMode.seriesId}
        editItem={modalMode.editItem}
        isSeries={modalMode.isSeries}
      />

      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Header & Quick Launch CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-stream-red/20 text-stream-red flex items-center justify-center shadow-lg glow-red-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                Uploader Studio Portal
              </h1>
              <p className="text-xs text-stream-gray-400">
                Real-time CDN analytical KPI summary, audience engagement & content publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetCatalog}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-stream-gray-300 hover:text-white font-bold rounded-2xl border border-white/10 text-xs flex items-center justify-center transition-all"
              title="Restore Demo Catalog if deleted"
            >
              <span>Restore Demo Catalog</span>
            </button>
            <button
              onClick={handleOpenNewTitle}
              className="px-6 py-3.5 bg-stream-red hover:bg-stream-red-hover text-white font-bold rounded-2xl shadow-xl glow-red flex items-center justify-center space-x-2.5 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Publish New Title (4K)</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-stream-gray-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Stream Views</span>
              <Eye className="w-4 h-4 text-stream-red" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{stats.totalViews?.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+24.8% vs last month</span>
            </span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-stream-gray-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Likes & Ratings</span>
              <Heart className="w-4 h-4 text-stream-red" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{stats.totalLikes?.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.2% audience approval</span>
            </span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-stream-gray-400 text-xs font-bold uppercase tracking-wider">
              <span>Active Concurrent Watchers</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white font-mono">{stats.activeWatchers?.toLocaleString()}</p>
            <span className="text-[11px] text-blue-400 font-semibold">Live 4K HDR streams across CDN</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-stream-gray-400 text-xs font-bold uppercase tracking-wider">
              <span>Estimated Ad/Royalty Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400 font-mono">{stats.estimatedRevenue}</p>
            <span className="text-[11px] text-stream-gray-400">Calculated at $0.0125/view rate</span>
          </div>
        </div>

        {/* Chart Simulation Area & Quick Stats */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Monthly Performance & Viewership Growth</h3>
              <p className="text-xs text-stream-gray-400">Comparative analytics across H1 2026</p>
            </div>
            <span className="px-3 py-1 rounded bg-stream-red/20 text-stream-red text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              Live Realtime Feed
            </span>
          </div>

          {/* Visual Bar/Line Chart Simulation */}
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 px-2 border-b border-white/10">
            {chartData.map((d, i) => {
              const maxViews = 200000;
              const heightPct = Math.min(Math.round((d.views / maxViews) * 100), 100);
              return (
                <div key={i} className="flex flex-col items-center space-y-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-stream-gray-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {(d.views / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-stream-red/40 to-stream-red rounded-t-lg group-hover:from-stream-red group-hover:to-red-400 transition-all shadow-md"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-bold text-stream-gray-400 uppercase">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Management Table Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('movies')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'movies' ? 'bg-stream-red text-white shadow-md glow-red-sm' : 'bg-stream-dark text-stream-gray-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Published Movies ({movies.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'series' ? 'bg-stream-red text-white shadow-md glow-red-sm' : 'bg-stream-dark text-stream-gray-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Original Series ({series.length})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {activeTab === 'movies' ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-stream-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-4">Title & Poster</th>
                    <th className="pb-3 px-4">Genre</th>
                    <th className="pb-3 px-4">Resolution</th>
                    <th className="pb-3 px-4">Views</th>
                    <th className="pb-3 px-4">Likes</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movies.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 flex items-center space-x-3">
                        <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-md shadow" />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{m.title}</p>
                          <span className="text-[10px] text-stream-gray-400">{m.releaseDate || '2026'} • {m.duration}m</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-stream-gray-300">{m.genre.split(',')[0]}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase text-white">
                          {m.resolution}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-white">{m.views?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-xs text-emerald-400">{m.likes?.toLocaleString()}</td>
                      <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(m, false)}
                          className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                          title="Edit Movie"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(m.id, m.title, false)}
                          className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => navigate(`/movie/${m.id}`)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors inline-block"
                        >
                          View Stream
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-stream-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-4">Series Title</th>
                    <th className="pb-3 px-4">Genre</th>
                    <th className="pb-3 px-4">Episodes</th>
                    <th className="pb-3 px-4">Total Views</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {series.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 flex items-center space-x-3">
                        <img src={s.poster} alt={s.title} className="w-10 h-14 object-cover rounded-md shadow" />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{s.title}</p>
                          <span className="text-[10px] text-stream-gray-400">{s.releaseYear} • {s.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-stream-gray-300">{s.genre.split(',')[0]}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded bg-stream-red/20 text-stream-red text-xs font-bold font-mono">
                          {s.episodes?.length || 0} Episodes
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-white">{s.views?.toLocaleString()}</td>
                      <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenAddEpisode(s.id)}
                          className="px-3 py-1.5 bg-stream-red/20 hover:bg-stream-red text-stream-red hover:text-white rounded-lg text-xs font-bold transition-all inline-block"
                        >
                          + Add Episode
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s, true)}
                          className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                          title="Edit Series"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(s.id, s.title, true)}
                          className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1"
                          title="Delete Series"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => navigate(`/series/${s.id}`)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors inline-block"
                        >
                          View Series
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploaderDashboard;
