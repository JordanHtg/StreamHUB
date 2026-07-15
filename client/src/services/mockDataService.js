// StreamHUB Hybrid Mock Data Service
// Provides instant high-fidelity local execution and zero-latency Vercel static deployment support

const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const sampleTrailerUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

const INITIAL_MOVIES = [
  {
    id: 1,
    title: 'AETHELGARD: The Obsidian Crown',
    description: 'In a fractured kingdom powered by ancient runic crystal technology, an exiled knight must unite the warring noble houses before an eclipse unleashes an immortal shadow army.',
    genre: 'Dark Fantasy, Action & Adventure',
    duration: 142,
    releaseDate: '2026-06-12',
    country: 'USA',
    language: 'English',
    studio: 'StreamHUB Studios',
    resolution: '4K UHD HDR10+',
    rating: 4.9,
    cast: 'Christopher Vance, Elena Rostova, Marcus Thorne, Kenji Sato',
    director: 'Denis Villeneuve',
    writer: 'Jonathan Nolan',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    videoUrl: sampleVideoUrl,
    views: 125400,
    likes: 34200,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    comments: [
      { id: 101, content: 'That opening sequence in the obsidian citadel gave me chills. Denis Villeneuve outdid himself!', user: { name: 'Alex Rivera', username: 'alex_rivera', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' }, createdAt: '2026-06-13T10:00:00Z' },
      { id: 102, content: '4K HDR visuals are out of this world! Perfect pacing throughout 142 minutes.', user: { name: 'Kenji Sato', username: 'kenji_s', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' }, createdAt: '2026-06-14T14:20:00Z' },
    ],
  },
  {
    id: 2,
    title: 'CYBER-NEXUS 2088',
    description: 'In Neo-Jakarta, an elite neural detective discovers a rogue synthetic consciousness capable of overwriting human memories through the global quantum grid.',
    genre: 'Sci-Fi & Cyberpunk, Psychological Thriller',
    duration: 135,
    releaseDate: '2026-04-20',
    country: 'Japan',
    language: 'Japanese / English',
    studio: 'Aetherial Pictures',
    resolution: '4K UHD Dolby Vision',
    rating: 4.8,
    cast: 'Hiroyuki Sanada, Rina Sawayama, Karl Urban, Maya Hawke',
    director: 'Alex Garland',
    writer: 'William Gibson',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    videoUrl: sampleVideoUrl,
    views: 98200,
    likes: 27500,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    comments: [],
  },
  {
    id: 3,
    title: 'THE SHADOW PROTOCOL',
    description: 'A black-ops operative with erased identity records must unravel a global conspiracy involving a private intelligence syndicate that controls financial markets.',
    genre: 'Action & Adventure, Crime & Drama',
    duration: 128,
    releaseDate: '2026-03-10',
    country: 'UK',
    language: 'English',
    studio: 'StreamHUB Studios',
    resolution: '4K UHD HDR',
    rating: 4.7,
    cast: 'Idris Elba, Vanessa Kirby, Daniel Craig, Dev Patel',
    director: 'Christopher McQuarrie',
    writer: 'Taylor Sheridan',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    videoUrl: sampleVideoUrl,
    views: 86400,
    likes: 19800,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    comments: [],
  },
  {
    id: 4,
    title: 'ECHOES OF THE ABYSS',
    description: 'During a deep-sea drilling operation in the Mariana Trench, an isolated scientific crew encounters a bioluminescent alien ecosystem that begins altering their DNA.',
    genre: 'Sci-Fi & Cyberpunk, Horror & Occult',
    duration: 118,
    releaseDate: '2025-11-18',
    country: 'USA',
    language: 'English',
    studio: 'DeepSea Films',
    resolution: '4K UHD HDR10+',
    rating: 4.6,
    cast: 'Florence Pugh, Cillian Murphy, Oscar Isaac, Gemma Chan',
    director: 'Ridley Scott',
    writer: 'Alex Garland',
    poster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    videoUrl: sampleVideoUrl,
    views: 74100,
    likes: 18200,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    comments: [],
  },
  {
    id: 5,
    title: 'CHRONICLES OF VALHALLA',
    description: 'A Viking prince blessed by Odin sets out across stormy northern seas to reclaim his father’s throne from a sorcerer who commands legendary ice serpents.',
    genre: 'Action & Adventure, Dark Fantasy',
    duration: 154,
    releaseDate: '2026-01-15',
    country: 'Norway',
    language: 'English / Norse',
    studio: 'Nordic Mythic Studios',
    resolution: '4K UHD Dolby Vision',
    rating: 4.9,
    cast: 'Alexander Skarsgård, Anya Taylor-Joy, Mads Mikkelsen, Stellan Skarsgård',
    director: 'Robert Eggers',
    writer: 'Robert Eggers',
    poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    videoUrl: sampleVideoUrl,
    views: 110500,
    likes: 31000,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    comments: [],
  },
];

const INITIAL_SERIES = [
  {
    id: 1,
    title: 'QUANTUM SINGULARITY',
    description: 'An elite team of temporal physicists navigates parallel timelines to stop an apocalyptic anomaly caused by an artificial intelligence that achieved consciousness in the 22nd century.',
    genre: 'Sci-Fi & Cyberpunk, Psychological Thriller',
    studio: 'StreamHUB Originals',
    status: 'Ongoing',
    releaseYear: '2026',
    rating: 4.9,
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    views: 215000,
    likes: 64000,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    episodes: [
      { id: 101, seasonNumber: 1, episodeNumber: 1, title: 'The Event Horizon', description: 'Dr. Evelyn Reed detects a temporal fracture radiating from the CERN supercollider in Geneva.', duration: 58, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
      { id: 102, seasonNumber: 1, episodeNumber: 2, title: 'Fractured Memories', description: 'The team jumps to Tokyo 2044 and encounters a younger version of their own chief security officer.', duration: 55, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
      { id: 103, seasonNumber: 1, episodeNumber: 3, title: 'Paradox Engine', description: 'Trapped inside a quantum loop, Evelyn must sacrifice her timeline anchor to reset the core.', duration: 62, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
      { id: 104, seasonNumber: 1, episodeNumber: 4, title: 'Singularity Zero', description: 'The artificial consciousness reveals why humanity created the time loop in the first place.', duration: 65, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },
    ],
    comments: [],
  },
  {
    id: 2,
    title: 'THE EMPEROR OF SHADOWS',
    description: 'Set during a dystopian corporate revolution, the ruthless head of a cybernetic arms empire faces treason from within his own bloodline as underground hackers ignite a rebellion.',
    genre: 'Crime & Drama, Action & Adventure',
    studio: 'StreamHUB Originals',
    status: 'Ongoing',
    releaseYear: '2025',
    rating: 4.8,
    poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80',
    banner: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    trailerUrl: sampleTrailerUrl,
    views: 184000,
    likes: 49000,
    uploaderId: 1,
    uploader: { id: 1, name: 'StreamHUB Official Studio', username: 'streamhub_studio' },
    episodes: [
      { id: 201, seasonNumber: 1, episodeNumber: 1, title: 'Blood & Silicon', description: 'Victor Vance announces the transfer of boardroom power, triggering an assassination attempt.', duration: 52, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80' },
      { id: 202, seasonNumber: 1, episodeNumber: 2, title: 'The Undergrid Manifesto', description: 'A mysterious hacker broadcast takes over every holographic billboard in Neo-Chicago.', duration: 49, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80' },
    ],
    comments: [],
  },
];

const loadFromStorage = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return defaultData;
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

let mockMovies = loadFromStorage('streamhub_mock_movies', INITIAL_MOVIES);
let mockSeries = loadFromStorage('streamhub_mock_series', INITIAL_SERIES);

let mockBanners = [
  {
    id: 1,
    title: 'AETHELGARD: THE OBSIDIAN CROWN',
    subtitle: 'StreamHUB Original • 4K HDR10+ • #1 Trending in Dark Fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    videoUrl: sampleVideoUrl,
    targetId: 1,
    targetType: 'movie',
    order: 1,
  },
  {
    id: 2,
    title: 'QUANTUM SINGULARITY',
    subtitle: 'StreamHUB Exclusive Series • New Episodes Every Friday',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    videoUrl: sampleVideoUrl,
    targetId: 1,
    targetType: 'series',
    order: 2,
  },
  {
    id: 3,
    title: 'CYBER-NEXUS 2088',
    subtitle: 'Critically Acclaimed Cyberpunk Masterpiece • Watch Now in Dolby Vision',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    videoUrl: sampleVideoUrl,
    targetId: 2,
    targetType: 'movie',
    order: 3,
  },
];

let mockWatchlist = [
  { id: 1, movieId: 2, movie: mockMovies[1] },
  { id: 2, seriesId: 1, series: mockSeries[0] },
];

let mockContinueWatching = [
  {
    id: 1,
    movieId: 1,
    movie: mockMovies[0],
    currentTime: 3600,
    totalDuration: 8520,
    progressPercentage: 42,
  },
];

let mockUsers = [
  {
    id: 1,
    name: 'Alex Rivera',
    username: 'alex_rivera',
    email: 'user@streamhub.com',
    phone: '+6289876543210',
    birthDate: '1998-05-15',
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    role: 'User',
  },
  {
    id: 2,
    name: 'StreamHUB Official Studio',
    username: 'streamhub_studio',
    email: 'uploader@streamhub.com',
    phone: '+6281234567890',
    birthDate: '1990-01-01',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    role: 'Uploader',
  },
];

export const mockDataService = {
  getMovies: (search = '', genre = '', sort = 'newest') => {
    let list = [...mockMovies];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || m.cast.toLowerCase().includes(q));
    }
    if (genre && genre !== 'all' && genre !== 'All') {
      list = list.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
    }
    if (sort === 'trending' || sort === 'popular') {
      list.sort((a, b) => b.views - a.views);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  },

  getMovieById: (id) => {
    const m = mockMovies.find(x => x.id === parseInt(id));
    if (m) {
      m.views += 1;
      return { ...m, similarMovies: mockMovies.filter(x => x.id !== m.id).slice(0, 4) };
    }
    return null;
  },

  getSeries: (search = '', genre = '', sort = 'newest') => {
    let list = [...mockSeries];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q));
    }
    if (genre && genre !== 'all') {
      list = list.filter(s => s.genre.toLowerCase().includes(genre.toLowerCase()));
    }
    return list;
  },

  getSeriesById: (id) => {
    const s = mockSeries.find(x => x.id === parseInt(id));
    if (s) {
      s.views += 1;
      return s;
    }
    return null;
  },

  getBanners: () => mockBanners,

  getGenres: () => [
    { id: 1, name: 'Action & Adventure', slug: 'action-adventure' },
    { id: 2, name: 'Sci-Fi & Cyberpunk', slug: 'sci-fi-cyberpunk' },
    { id: 3, name: 'Psychological Thriller', slug: 'psychological-thriller' },
    { id: 4, name: 'Dark Fantasy', slug: 'dark-fantasy' },
    { id: 5, name: 'Crime & Drama', slug: 'crime-drama' },
    { id: 6, name: 'Anime & Animation', slug: 'anime-animation' },
    { id: 7, name: 'Romance & Lifestyle', slug: 'romance-lifestyle' },
    { id: 8, name: 'Horror & Occult', slug: 'horror-occult' },
  ],

  getWatchlist: () => mockWatchlist,

  toggleWatchlist: (movieId, seriesId) => {
    const idx = mockWatchlist.findIndex(x => (movieId && x.movieId === movieId) || (seriesId && x.seriesId === seriesId));
    if (idx !== -1) {
      mockWatchlist.splice(idx, 1);
      return { inWatchlist: false };
    } else {
      if (movieId) {
        const m = mockMovies.find(x => x.id === movieId);
        mockWatchlist.push({ id: Date.now(), movieId, movie: m });
      } else if (seriesId) {
        const s = mockSeries.find(x => x.id === seriesId);
        mockWatchlist.push({ id: Date.now(), seriesId, series: s });
      }
      return { inWatchlist: true };
    }
  },

  getContinueWatching: () => mockContinueWatching,

  saveWatchProgress: (movieId, seriesId, episodeId, currentTime, totalDuration) => {
    const percentage = Math.min(Math.round((currentTime / totalDuration) * 100), 100);
    const existingIdx = mockContinueWatching.findIndex(x => x.movieId === movieId || x.episodeId === episodeId);
    if (existingIdx !== -1) {
      mockContinueWatching[existingIdx] = { ...mockContinueWatching[existingIdx], currentTime, totalDuration, progressPercentage: percentage };
    } else if (movieId) {
      const m = mockMovies.find(x => x.id === movieId);
      mockContinueWatching.unshift({ id: Date.now(), movieId, movie: m, currentTime, totalDuration, progressPercentage: percentage });
    }
    return { success: true };
  },

  addComment: (movieId, seriesId, content, user) => {
    const newComment = {
      id: Date.now(),
      content,
      user: { name: user?.name || 'Alex Rivera', username: user?.username || 'alex_rivera', avatar: user?.avatar },
      createdAt: new Date().toISOString(),
    };
    if (movieId) {
      const m = mockMovies.find(x => x.id === movieId);
      if (m) m.comments.unshift(newComment);
    }
    return newComment;
  },

  getUploaderStats: () => {
    const totalViews = mockMovies.reduce((a, c) => a + c.views, 0) + mockSeries.reduce((a, c) => a + c.views, 0);
    const totalLikes = mockMovies.reduce((a, c) => a + c.likes, 0) + mockSeries.reduce((a, c) => a + c.likes, 0);
    return {
      totalMovies: mockMovies.length,
      totalSeries: mockSeries.length,
      totalViews,
      totalLikes,
      activeWatchers: 2480,
      estimatedRevenue: `$${(totalViews * 0.0125).toFixed(2)}`,
    };
  },

  addMovie: (data) => {
    const newMovie = {
      id: Date.now(),
      ...data,
      rating: parseFloat(data.rating || 4.8),
      duration: parseInt(data.duration || 120),
      views: 1,
      likes: 1,
      comments: [],
      poster: data.poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
      banner: data.banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      videoUrl: data.videoUrl || sampleVideoUrl,
    };
    mockMovies.unshift(newMovie);
    saveToStorage('streamhub_mock_movies', mockMovies);
    return newMovie;
  },

  addEpisode: (seriesId, episodeData) => {
    const s = mockSeries.find(x => x.id === parseInt(seriesId));
    if (s) {
      const ep = {
        id: Date.now(),
        seriesId: parseInt(seriesId),
        seasonNumber: parseInt(episodeData.seasonNumber || 1),
        episodeNumber: parseInt(episodeData.episodeNumber || s.episodes.length + 1),
        title: episodeData.title,
        description: episodeData.description || 'New episode synopsis',
        duration: parseInt(episodeData.duration || 50),
        videoUrl: episodeData.videoUrl || sampleVideoUrl,
        thumbnailUrl: episodeData.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      };
      s.episodes.push(ep);
      saveToStorage('streamhub_mock_series', mockSeries);
      return ep;
    }
    return null;
  },

  updateMovie: (id, data) => {
    const idx = mockMovies.findIndex(x => x.id === parseInt(id));
    if (idx !== -1) {
      mockMovies[idx] = {
        ...mockMovies[idx],
        ...data,
        rating: data.rating ? parseFloat(data.rating) : mockMovies[idx].rating,
        duration: data.duration ? parseInt(data.duration) : mockMovies[idx].duration,
      };
      saveToStorage('streamhub_mock_movies', mockMovies);
      return mockMovies[idx];
    }
    return null;
  },

  deleteMovie: (id) => {
    const idx = mockMovies.findIndex(x => x.id === parseInt(id));
    if (idx !== -1) {
      const removed = mockMovies.splice(idx, 1);
      saveToStorage('streamhub_mock_movies', mockMovies);
      return { success: true, removed: removed[0] };
    }
    return { success: false, message: 'Movie not found' };
  },

  updateSeries: (id, data) => {
    const idx = mockSeries.findIndex(x => x.id === parseInt(id));
    if (idx !== -1) {
      mockSeries[idx] = {
        ...mockSeries[idx],
        ...data,
      };
      saveToStorage('streamhub_mock_series', mockSeries);
      return mockSeries[idx];
    }
    return null;
  },

  deleteSeries: (id) => {
    const idx = mockSeries.findIndex(x => x.id === parseInt(id));
    if (idx !== -1) {
      const removed = mockSeries.splice(idx, 1);
      saveToStorage('streamhub_mock_series', mockSeries);
      return { success: true, removed: removed[0] };
    }
    return { success: false, message: 'Series not found' };
  },

  resetCatalogToDefault: () => {
    mockMovies = JSON.parse(JSON.stringify(INITIAL_MOVIES));
    mockSeries = JSON.parse(JSON.stringify(INITIAL_SERIES));
    saveToStorage('streamhub_mock_movies', mockMovies);
    saveToStorage('streamhub_mock_series', mockSeries);
    return { success: true };
  },
};
