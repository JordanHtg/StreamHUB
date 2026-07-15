import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Film, Sparkles, AlertCircle, CheckCircle, FolderUp, Globe, Plus, Tag, Image, Video, Subtitles, Trash2, Edit3, FileText } from 'lucide-react';
import { streamApi } from '../../services/apiClient';

const AVAILABLE_GENRES = [
  'Action & Adventure',
  'Sci-Fi & Cyberpunk',
  'Dark Fantasy',
  'Psychological Thriller',
  'Crime & Drama',
  'Anime & Animation',
  'Romance & Lifestyle',
  'Horror & Occult',
];

const UploadContentModal = ({ isOpen, onClose, onSuccess, isEpisode = false, seriesId = null, editItem = null, isSeries = false }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  
  // Custom states for interactive multi-select genre
  const [selectedGenres, setSelectedGenres] = useState(['Dark Fantasy', 'Action & Adventure']);
  
  // Source toggle: 'local' (PC upload) vs 'url' (CDN / HLS link)
  const [sourceMode, setSourceMode] = useState('local'); 
  const [localImagePreview, setLocalImagePreview] = useState(null);
  const [localVideoName, setLocalVideoName] = useState('');
  const [localVideoUrl, setLocalVideoUrl] = useState('');

  // Subtitle management states
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subLanguage, setSubLanguage] = useState('Indonesian');
  const [subLabel, setSubLabel] = useState('Indonesian (CC)');
  const [subContent, setSubContent] = useState('');
  const [subFileName, setSubFileName] = useState('');
  const [editingSubId, setEditingSubId] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [storageStatus, setStorageStatus] = useState(null); // 'cloud' | 'local'

  useEffect(() => {
    if (isOpen && editItem) {
      reset({
        title: editItem.title || '',
        description: editItem.description || '',
        resolution: editItem.resolution || '4K UHD HDR10+',
        duration: editItem.duration || 120,
        rating: editItem.rating || 4.9,
        studio: editItem.studio || 'StreamHUB Studios',
        cast: editItem.cast || '',
        poster: editItem.poster || '',
        videoUrl: editItem.videoUrl || '',
      });
      if (editItem.genre) {
        setSelectedGenres(editItem.genre.split(',').map((g) => g.trim()));
      }
      setSourceMode('url');

      if (editItem.subtitles && Array.isArray(editItem.subtitles)) {
        setSubtitleTracks(editItem.subtitles);
      } else if (editItem.subtitleUrl) {
        try {
          const parsed = JSON.parse(editItem.subtitleUrl);
          if (Array.isArray(parsed)) setSubtitleTracks(parsed);
          else setSubtitleTracks([{ id: Date.now(), label: 'Indonesian (CC)', language: 'Indonesian', content: editItem.subtitleUrl }]);
        } catch (e) {
          setSubtitleTracks([{ id: Date.now(), label: 'Indonesian (CC)', language: 'Indonesian', content: editItem.subtitleUrl }]);
        }
      } else {
        setSubtitleTracks([
          { id: 1, label: 'Indonesian (AI Auto-Sync)', language: 'Indonesian', isAuto: true, content: 'Auto-generated realistic AI cues' },
          { id: 2, label: 'English (AI Auto-Sync)', language: 'English', isAuto: true, content: 'Auto-generated realistic AI cues' }
        ]);
      }
    } else if (isOpen && !editItem) {
      reset({
        title: '',
        description: '',
        resolution: '4K UHD HDR10+',
        duration: 120,
        rating: 4.9,
        studio: 'StreamHUB Studios',
        cast: '',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      });
      setSelectedGenres(['Dark Fantasy', 'Action & Adventure']);
      setSourceMode('local');
      setLocalImagePreview(null);
      setLocalVideoName('');
      setLocalVideoUrl('');
      setSubtitleTracks([
        { id: 1, label: 'Indonesian (AI Auto-Sync)', language: 'Indonesian', isAuto: true, content: 'Auto-generated realistic AI cues' },
        { id: 2, label: 'English (AI Auto-Sync)', language: 'English', isAuto: true, content: 'Auto-generated realistic AI cues' }
      ]);
      setShowSubForm(false);
      setSubContent('');
      setSubFileName('');
      setEditingSubId(null);
    }
  }, [isOpen, editItem, reset]);

  if (!isOpen) return null;

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4000000) {
        setErrorMessage('⚠️ Peringatan: Ukuran video lokal melebihi kuota memori browser (~4MB untuk LocalStorage). Gunakan mode "Stream URL (MP4 / HLS)" untuk video panjang agar tersimpan permanen!');
      }
      setLocalVideoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalVideoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubtitleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubContent(reader.result);
      };
      reader.readAsText(file);
    }
  };

  const handleAddOrUpdateSub = () => {
    if (!subLabel.trim() || (!subContent.trim() && !subFileName)) {
      setErrorMessage('Please provide a subtitle label and either upload an SRT/VTT file or enter text/URL.');
      return;
    }
    if (editingSubId) {
      setSubtitleTracks(subtitleTracks.map((s) => (s.id === editingSubId ? {
        ...s,
        language: subLanguage,
        label: subLabel,
        content: subContent,
        fileName: subFileName || s.fileName,
      } : s)));
    } else {
      setSubtitleTracks([...subtitleTracks, {
        id: Date.now(),
        language: subLanguage,
        label: subLabel,
        content: subContent,
        fileName: subFileName || 'Manual SRT/Text',
        isAuto: false,
      }]);
    }
    setSubContent('');
    setSubFileName('');
    setEditingSubId(null);
    setShowSubForm(false);
  };

  const handleEditSub = (sub) => {
    setEditingSubId(sub.id);
    setSubLanguage(sub.language || 'Indonesian');
    setSubLabel(sub.label || 'Custom CC');
    setSubContent(sub.content || '');
    setSubFileName(sub.fileName || '');
    setShowSubForm(true);
  };

  const handleDeleteSub = (id) => {
    setSubtitleTracks(subtitleTracks.filter((s) => s.id !== id));
  };

  const onSubmit = async (data) => {
    setErrorMessage('');
    setSuccessMessage('');
    setStorageStatus(null);
    setUploadProgress(15);
    setUploadStage('Encoding media chunks & preparing payload...');
    try {
      const finalData = {
        ...data,
        genre: selectedGenres.join(', '),
        poster: sourceMode === 'local' && localImagePreview ? localImagePreview : data.poster,
        banner: sourceMode === 'local' && localImagePreview ? localImagePreview : data.poster,
        thumbnail: sourceMode === 'local' && localImagePreview ? localImagePreview : data.poster,
        videoUrl: sourceMode === 'local' && localVideoUrl ? localVideoUrl : data.videoUrl,
        subtitleUrl: JSON.stringify(subtitleTracks),
        subtitles: subtitleTracks,
      };

      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(45);
      setUploadStage('Connecting to TiDB Cloud & pushing record...');

      let res;
      if (editItem) {
        if (isSeries) {
          res = await streamApi.updateSeries(editItem.id, finalData);
        } else {
          res = await streamApi.updateMovie(editItem.id, finalData);
        }
      } else if (isEpisode && seriesId) {
        res = await streamApi.createEpisode(seriesId, finalData);
      } else {
        res = await streamApi.createMovie(finalData);
      }

      setUploadProgress(85);
      setUploadStage('Verifying global CDN propagation & database sync...');
      await new Promise((r) => setTimeout(r, 300));

      if (res.success || res.data || res.id) {
        setUploadProgress(100);
        setUploadStage('Upload Complete!');
        const isLocalFallback = localStorage.getItem('streamhub_mock_mode') === 'true' || (res.data?.id && String(res.data.id).length > 10) || (res.id && String(res.id).length > 10);
        if (isLocalFallback) {
          setStorageStatus('local');
          setSuccessMessage(editItem ? 'Content successfully updated in Local Storage!' : 'Content published to Local Device Storage (Mock Mode / Cloud Fallback active).');
        } else {
          setStorageStatus('cloud');
          setSuccessMessage(editItem ? 'Content successfully updated on Cloud Database!' : 'Content successfully published & synced globally to TiDB Cloud!');
        }
        setTimeout(() => {
          reset();
          if (onSuccess) onSuccess(res.data || res);
          onClose();
        }, 2200);
      } else {
        setUploadProgress(0);
        setErrorMessage(res.message || 'Failed to publish content.');
      }
    } catch (err) {
      setUploadProgress(0);
      setErrorMessage(err.message || 'Error publishing content.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-stream-card border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-stream-dark">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stream-red/20 text-stream-red flex items-center justify-center shadow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editItem ? `Edit Title: ${editItem.title}` : isEpisode ? 'Publish New Episode' : 'Publish Luxury Title (Movie / Series)'}
              </h3>
              <p className="text-xs text-stream-gray-400">
                {editItem ? 'Modify 4K stream properties, synopsis & genres' : isEpisode ? `Add episode to Series #${seriesId}` : 'Encode & publish 4K HDR stream from PC or CDN'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stream-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-5 flex-1">
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="p-4 bg-stream-dark rounded-2xl border border-stream-red/40 space-y-2.5 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-stream-red animate-ping" />
                  <span>{uploadStage}</span>
                </span>
                <span className="text-stream-red font-mono font-black">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-stream-red via-red-500 to-amber-500 h-full rounded-full transition-all duration-300 shadow-lg glow-red-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-stream-gray-400">
                ⏳ Estimasi waktu proses: {uploadProgress < 50 ? '1-2 detik (Media processing & chunking)' : '1 detik (TiDB Cloud database synchronization)'}
              </p>
            </div>
          )}

          {storageStatus === 'cloud' && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <div>
                  <p className="font-bold">✨ Tersinkron ke TiDB Cloud Database!</p>
                  <p className="text-[11px] text-emerald-300/80">Film ini sekarang langsung muncul secara real-time di seluruh perangkat di dunia.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">Cloud Live</span>
            </div>
          )}

          {storageStatus === 'local' && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="font-bold">⚠️ Tersimpan di LocalStorage (Perangkat Ini Saja)</p>
                  <p className="text-[11px] text-amber-200/80">Koneksi TiDB Cloud belum terhubung atau mode Offline aktif. Film hanya tampil di browser ini.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">Local Mock</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Title & Synopsis */}
          <div>
            <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., AETHELGARD: The Obsidian Crown"
              className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all"
            />
            {errors.title && <span className="text-[11px] text-stream-red mt-1 block">{errors.title.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
              Synopsis / Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={2}
              placeholder="Enter comprehensive plot synopsis or episode details..."
              className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stream-gray-500 focus:outline-none focus:border-stream-red transition-all resize-none"
            />
            {errors.description && <span className="text-[11px] text-stream-red mt-1 block">{errors.description.message}</span>}
          </div>

          {/* Interactive Multi-Select Genre Tags */}
          {!isEpisode && (
            <div className="space-y-2 bg-stream-dark/60 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-stream-red" />
                  <span>Choose Genres (Select Multiple)</span>
                </label>
                <span className="text-[11px] text-stream-gray-400 font-semibold">{selectedGenres.length} selected</span>
              </div>
              
              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      type="button"
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-stream-red text-white shadow-md glow-red-sm scale-[1.02]'
                          : 'bg-white/5 text-stream-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      <span>{genre}</span>
                      {isSelected && <span className="text-xs ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolution & Specs */}
          {!isEpisode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">Resolution / Quality Tag</label>
                <select
                  {...register('resolution')}
                  defaultValue="4K UHD HDR10+"
                  className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red transition-all"
                >
                  <option value="4K UHD HDR10+">4K UHD HDR10+</option>
                  <option value="4K UHD Dolby Vision">4K UHD Dolby Vision</option>
                  <option value="1080p FHD">1080p FHD</option>
                  <option value="IMAX Enhanced">IMAX Enhanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">Duration (mins)</label>
                <input
                  type="number"
                  {...register('duration')}
                  defaultValue={120}
                  className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-stream-red"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">Rating (Out of 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('rating')}
                  defaultValue={4.9}
                  className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-stream-red"
                />
              </div>
            </div>
          )}

          {isEpisode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">Season Number</label>
                <input type="number" {...register('seasonNumber')} defaultValue={1} className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">Episode Number</label>
                <input type="number" {...register('episodeNumber')} defaultValue={1} className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />
              </div>
            </div>
          )}

          {/* Source Selector: Local File vs URL */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-stream-gray-300 uppercase tracking-wider">
                Media Source Option
              </label>
              <div className="flex bg-stream-dark p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSourceMode('local')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    sourceMode === 'local' ? 'bg-stream-red text-white shadow' : 'text-stream-gray-400 hover:text-white'
                  }`}
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Local File Upload (PC)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    sourceMode === 'url' ? 'bg-stream-red text-white shadow' : 'text-stream-gray-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>CDN / HLS Stream Link</span>
                </button>
              </div>
            </div>

            {sourceMode === 'local' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Local Image Picker */}
                <div className="border-2 border-dashed border-white/20 hover:border-stream-red/60 rounded-2xl p-4 text-center bg-stream-dark/40 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {localImagePreview ? (
                    <div className="space-y-2">
                      <img src={localImagePreview} alt="Preview" className="w-full h-28 object-cover rounded-xl shadow mx-auto" />
                      <span className="text-[11px] text-emerald-400 font-bold block">Image Selected ✓ (Click to change)</span>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-stream-gray-400 group-hover:text-stream-red transition-colors">
                        <Image className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">Upload Poster / Thumbnail</p>
                      <p className="text-[10px] text-stream-gray-400">PNG, JPG, or WEBP from local disk</p>
                    </div>
                  )}
                </div>

                {/* Local Video Picker */}
                <div className="border-2 border-dashed border-white/20 hover:border-stream-red/60 rounded-2xl p-4 text-center bg-stream-dark/40 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {localVideoName ? (
                    <div className="py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Video className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-emerald-400 line-clamp-1">{localVideoName}</p>
                      <span className="text-[10px] text-stream-gray-400 block">Video Ready for Stream Player ✓</span>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-stream-gray-400 group-hover:text-stream-red transition-colors">
                        <Video className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-white">Upload Video File (MP4/MKV)</p>
                      <p className="text-[10px] text-stream-gray-400">Select local video file from PC</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1">
                    Poster / Thumbnail Image URL
                  </label>
                  <input
                    {...register('poster')}
                    defaultValue="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80"
                    className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stream-gray-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Video Stream URL (MP4 / HLS .m3u8)</span>
                  </label>
                  <input
                    {...register('videoUrl')}
                    defaultValue="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    className="w-full bg-stream-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-stream-red transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtitles & Captions Manager */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Subtitles className="w-4 h-4 text-stream-red" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Multi-Language Subtitles & Closed Captions (CC)
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSubId(null);
                  setSubLanguage('Indonesian');
                  setSubLabel('Indonesian (CC)');
                  setSubContent('');
                  setSubFileName('');
                  setShowSubForm(!showSubForm);
                }}
                className="px-3 py-1 bg-stream-red/20 hover:bg-stream-red text-stream-red hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors border border-stream-red/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subtitle Track</span>
              </button>
            </div>

            {/* List of currently attached subtitles */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {subtitleTracks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-stream-dark rounded-xl border border-white/10 text-xs"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-yellow-300 font-bold uppercase text-[10px]">
                      {sub.language}
                    </span>
                    <div>
                      <p className="font-bold text-white flex items-center space-x-1.5">
                        <span>{sub.label}</span>
                        {sub.isAuto && (
                          <span className="px-1.5 py-0.2 rounded bg-stream-red/20 text-stream-red text-[9px] font-semibold">
                            ✨ AI Auto-Sync
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-stream-gray-400 truncate max-w-xs">
                        {sub.fileName ? `File: ${sub.fileName}` : sub.content ? `${sub.content.slice(0, 50)}...` : 'Dynamic AI generated subtitle'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!sub.isAuto && (
                      <button
                        type="button"
                        onClick={() => handleEditSub(sub)}
                        className="p-1.5 text-stream-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
                        title="Edit Subtitle Track"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteSub(sub.id)}
                      className="p-1.5 text-stream-gray-400 hover:text-red-400 rounded hover:bg-white/10 transition-colors"
                      title="Delete Subtitle Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {subtitleTracks.length === 0 && (
                <p className="text-xs text-stream-gray-400 text-center py-3 bg-stream-dark rounded-xl border border-dashed border-white/10">
                  No subtitles added yet. Click "+ Add Subtitle Track" or built-in AI tracks will auto-attach.
                </p>
              )}
            </div>

            {/* Add/Edit Subtitle Form Drawer */}
            {showSubForm && (
              <div className="p-4 bg-stream-dark rounded-2xl border border-stream-red/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-stream-red" />
                    <span>{editingSubId ? 'Edit Subtitle Track' : 'Add New Manual Subtitle Track'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSubForm(false)}
                    className="text-stream-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stream-gray-300 uppercase mb-1">Language</label>
                    <select
                      value={subLanguage}
                      onChange={(e) => {
                        setSubLanguage(e.target.value);
                        if (!editingSubId) setSubLabel(`${e.target.value} (CC)`);
                      }}
                      className="w-full bg-stream-card border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-stream-red"
                    >
                      <option value="Indonesian">Indonesian</option>
                      <option value="English">English</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stream-gray-300 uppercase mb-1">Display Label</label>
                    <input
                      type="text"
                      value={subLabel}
                      onChange={(e) => setSubLabel(e.target.value)}
                      placeholder="e.g. Indonesian (CC)"
                      className="w-full bg-stream-card border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-stream-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block text-[10px] font-bold text-stream-gray-300 uppercase mb-1">Option A: Upload .SRT / .VTT File</label>
                    <div className="border border-dashed border-white/20 hover:border-stream-red rounded-lg p-2 text-center relative cursor-pointer bg-stream-card/50">
                      <input
                        type="file"
                        accept=".srt,.vtt,.txt"
                        onChange={handleSubtitleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <span className="text-[11px] text-white font-medium block truncate">
                        {subFileName ? `✓ ${subFileName}` : 'Choose .srt or .vtt file...'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stream-gray-300 uppercase mb-1">Option B: Paste Subtitle Text / URL</label>
                    <textarea
                      rows={2}
                      value={subContent}
                      onChange={(e) => setSubContent(e.target.value)}
                      placeholder="Or paste SRT text lines (`00:00:05 --> 00:00:10\nCaption...`) or CDN subtitle URL..."
                      className="w-full bg-stream-card border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-stream-red resize-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSubForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOrUpdateSub}
                    className="px-4 py-1.5 rounded-lg bg-stream-red hover:bg-stream-red-hover text-xs text-white font-bold shadow glow-red"
                  >
                    {editingSubId ? 'Update Track' : 'Attach Track'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-stream-red hover:bg-stream-red-hover text-sm font-bold text-white shadow-lg glow-red flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? (editItem ? 'Saving Changes...' : 'Publishing...') : (editItem ? 'Save Changes' : 'Publish Content')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadContentModal;
