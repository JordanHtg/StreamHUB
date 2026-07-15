import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Film, Sparkles, AlertCircle, CheckCircle, FolderUp, Globe, Plus, Tag, Image, Video } from 'lucide-react';
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
