import axios from 'axios';
import { mockDataService } from './mockDataService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('streamhub_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper: check if we should fallback to hybrid mock engine
const isMockMode = () => localStorage.getItem('streamhub_mock_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';

export const streamApi = {
  // Movies
  getMovies: async (params = {}) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getMovies(params.search, params.genre, params.sort) };
    }
    try {
      const res = await axiosInstance.get('/movies', { params });
      return res.data;
    } catch (err) {
      console.warn('API connection fallback to hybrid mock engine for getMovies');
      return { success: true, data: mockDataService.getMovies(params.search, params.genre, params.sort) };
    }
  },

  getMovieById: async (id) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getMovieById(id) };
    }
    try {
      const res = await axiosInstance.get(`/movies/${id}`);
      return res.data;
    } catch (err) {
      console.warn('API connection fallback for getMovieById');
      return { success: true, data: mockDataService.getMovieById(id) };
    }
  },

  // Series
  getSeries: async (params = {}) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getSeries(params.search, params.genre, params.sort) };
    }
    try {
      const res = await axiosInstance.get('/series', { params });
      return res.data;
    } catch (err) {
      console.warn('API connection fallback for getSeries');
      return { success: true, data: mockDataService.getSeries(params.search, params.genre, params.sort) };
    }
  },

  getSeriesById: async (id) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getSeriesById(id) };
    }
    try {
      const res = await axiosInstance.get(`/series/${id}`);
      return res.data;
    } catch (err) {
      console.warn('API connection fallback for getSeriesById');
      return { success: true, data: mockDataService.getSeriesById(id) };
    }
  },

  // Banners & Categories & Genres
  getBanners: async () => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getBanners() };
    }
    try {
      const res = await axiosInstance.get('/banners');
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.getBanners() };
    }
  },

  getGenres: async () => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getGenres() };
    }
    try {
      const res = await axiosInstance.get('/genres');
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.getGenres() };
    }
  },

  // User Actions
  getWatchlist: async () => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.getWatchlist() };
    }
    try {
      const res = await axiosInstance.get('/user/watchlist');
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.getWatchlist() };
    }
  },

  toggleWatchlist: async (movieId, seriesId) => {
    if (isMockMode()) {
      return { success: true, ...mockDataService.toggleWatchlist(movieId, seriesId) };
    }
    try {
      const res = await axiosInstance.post('/user/watchlist', { movieId, seriesId });
      return res.data;
    } catch (err) {
      return { success: true, ...mockDataService.toggleWatchlist(movieId, seriesId) };
    }
  },

  getProfile: async () => {
    if (isMockMode()) {
      const stored = localStorage.getItem('streamhub_user');
      const user = stored ? JSON.parse(stored) : { name: 'Alex Rivera', username: 'alex_rivera', email: 'user@streamhub.com', role: 'User' };
      return {
        success: true,
        data: {
          ...user,
          stats: { watchlistCount: mockDataService.getWatchlist().length, favoriteCount: 3, continueWatchingCount: mockDataService.getContinueWatching().length },
          continueWatching: mockDataService.getContinueWatching(),
        },
      };
    }
    try {
      const res = await axiosInstance.get('/user/profile');
      return res.data;
    } catch (err) {
      const stored = localStorage.getItem('streamhub_user');
      const user = stored ? JSON.parse(stored) : { name: 'Alex Rivera', username: 'alex_rivera', email: 'user@streamhub.com', role: 'User' };
      return {
        success: true,
        data: {
          ...user,
          stats: { watchlistCount: mockDataService.getWatchlist().length, favoriteCount: 3, continueWatchingCount: mockDataService.getContinueWatching().length },
          continueWatching: mockDataService.getContinueWatching(),
        },
      };
    }
  },

  saveWatchProgress: async (movieId, seriesId, episodeId, currentTime, totalDuration) => {
    if (isMockMode()) {
      return mockDataService.saveWatchProgress(movieId, seriesId, episodeId, currentTime, totalDuration);
    }
    try {
      const res = await axiosInstance.post('/user/progress', { movieId, seriesId, episodeId, currentTime, totalDuration });
      return res.data;
    } catch (err) {
      return mockDataService.saveWatchProgress(movieId, seriesId, episodeId, currentTime, totalDuration);
    }
  },

  addComment: async (movieId, seriesId, episodeId, content, user) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.addComment(movieId, seriesId, content, user) };
    }
    try {
      const res = await axiosInstance.post('/user/comments', { movieId, seriesId, episodeId, content });
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.addComment(movieId, seriesId, content, user) };
    }
  },

  // Uploader Dashboard Actions
  getUploaderStatistics: async () => {
    if (isMockMode()) {
      return {
        success: true,
        statistics: mockDataService.getUploaderStats(),
        chartData: [
          { month: 'Jan', views: 24000, revenue: 300 },
          { month: 'Feb', views: 42000, revenue: 525 },
          { month: 'Mar', views: 68000, revenue: 850 },
          { month: 'Apr', views: 95000, revenue: 1187 },
          { month: 'May', views: 142000, revenue: 1775 },
          { month: 'Jun', views: 198000, revenue: 2475 },
        ],
        recentContent: {
          movies: mockDataService.getMovies(),
          series: mockDataService.getSeries(),
        },
      };
    }
    try {
      const res = await axiosInstance.get('/uploader/statistics');
      return res.data;
    } catch (err) {
      return {
        success: true,
        statistics: mockDataService.getUploaderStats(),
        chartData: [
          { month: 'Jan', views: 24000, revenue: 300 },
          { month: 'Feb', views: 42000, revenue: 525 },
          { month: 'Mar', views: 68000, revenue: 850 },
          { month: 'Apr', views: 95000, revenue: 1187 },
          { month: 'May', views: 142000, revenue: 1775 },
          { month: 'Jun', views: 198000, revenue: 2475 },
        ],
        recentContent: {
          movies: mockDataService.getMovies(),
          series: mockDataService.getSeries(),
        },
      };
    }
  },

  createMovie: async (movieData) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.addMovie(movieData) };
    }
    try {
      const res = await axiosInstance.post('/movies', movieData);
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.addMovie(movieData) };
    }
  },

  createEpisode: async (seriesId, episodeData) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.addEpisode(seriesId, episodeData) };
    }
    try {
      const res = await axiosInstance.post('/series/episodes', { seriesId, ...episodeData });
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.addEpisode(seriesId, episodeData) };
    }
  },

  updateMovie: async (id, movieData) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.updateMovie(id, movieData) };
    }
    try {
      const res = await axiosInstance.put(`/movies/${id}`, movieData);
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.updateMovie(id, movieData) };
    }
  },

  deleteMovie: async (id) => {
    if (isMockMode()) {
      return mockDataService.deleteMovie(id);
    }
    try {
      const res = await axiosInstance.delete(`/movies/${id}`);
      return res.data;
    } catch (err) {
      return mockDataService.deleteMovie(id);
    }
  },

  updateSeries: async (id, seriesData) => {
    if (isMockMode()) {
      return { success: true, data: mockDataService.updateSeries(id, seriesData) };
    }
    try {
      const res = await axiosInstance.put(`/series/${id}`, seriesData);
      return res.data;
    } catch (err) {
      return { success: true, data: mockDataService.updateSeries(id, seriesData) };
    }
  },

  deleteSeries: async (id) => {
    if (isMockMode()) {
      return mockDataService.deleteSeries(id);
    }
    try {
      const res = await axiosInstance.delete(`/series/${id}`);
      return res.data;
    } catch (err) {
      return mockDataService.deleteSeries(id);
    }
  },

  resetCatalogToDefault: () => {
    return mockDataService.resetCatalogToDefault();
  },
};
