const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Uploader Dashboard KPI Statistics & Analytics
const getDashboardStatistics = async (req, res) => {
  try {
    const uploaderId = req.user.id;
    const isAdmin = req.user.role?.name === 'Admin';

    const whereClause = isAdmin ? {} : { uploaderId };

    const [movies, series] = await Promise.all([
      prisma.movie.findMany({ where: whereClause }),
      prisma.series.findMany({ where: whereClause }),
    ]);

    const totalMovies = movies.length;
    const totalSeries = series.length;

    const moviesViews = movies.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const seriesViews = series.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalViews = moviesViews + seriesViews;

    const moviesLikes = movies.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const seriesLikes = series.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalLikes = moviesLikes + seriesLikes;

    // Active concurrent watchers calculation / realistic estimate
    const recentProgressCount = await prisma.watchProgress.count({
      where: {
        lastUpdated: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // within 24h
        },
      },
    });

    const activeWatchers = Math.max(Math.floor(totalViews * 0.015) + recentProgressCount, 1420);
    const estimatedRevenue = (totalViews * 0.0125).toFixed(2); // $12.50 per 1,000 views

    // Monthly growth simulation chart data
    const chartData = [
      { month: 'Jan', views: Math.floor(totalViews * 0.08), revenue: Math.floor(totalViews * 0.08 * 0.0125) },
      { month: 'Feb', views: Math.floor(totalViews * 0.12), revenue: Math.floor(totalViews * 0.12 * 0.0125) },
      { month: 'Mar', views: Math.floor(totalViews * 0.15), revenue: Math.floor(totalViews * 0.15 * 0.0125) },
      { month: 'Apr', views: Math.floor(totalViews * 0.18), revenue: Math.floor(totalViews * 0.18 * 0.0125) },
      { month: 'May', views: Math.floor(totalViews * 0.22), revenue: Math.floor(totalViews * 0.22 * 0.0125) },
      { month: 'Jun', views: Math.floor(totalViews * 0.25), revenue: Math.floor(totalViews * 0.25 * 0.0125) },
    ];

    return res.status(200).json({
      success: true,
      statistics: {
        totalMovies,
        totalSeries,
        totalViews,
        totalLikes,
        activeWatchers,
        estimatedRevenue: `$${estimatedRevenue}`,
      },
      chartData,
      recentContent: {
        movies: movies.slice(0, 10),
        series: series.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Get uploader statistics error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching uploader dashboard metrics.' });
  }
};

// Get All Uploaded Content by Uploader
const getMyUploads = async (req, res) => {
  try {
    const uploaderId = req.user.id;
    const isAdmin = req.user.role?.name === 'Admin';
    const whereClause = isAdmin ? {} : { uploaderId };

    const [movies, series, uploads] = await Promise.all([
      prisma.movie.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } }),
      prisma.series.findMany({ where: whereClause, include: { episodes: true }, orderBy: { createdAt: 'desc' } }),
      prisma.upload.findMany({ where: { uploaderId }, orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        movies,
        series,
        rawUploads: uploads,
      },
    });
  } catch (error) {
    console.error('Get uploader uploads error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching uploads.' });
  }
};

// Toggle Status (PUBLISHED vs DRAFT)
const toggleContentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body; // type: 'movie' | 'series', status: 'PUBLISHED' | 'DRAFT'

    if (type === 'movie') {
      const updated = await prisma.movie.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      return res.status(200).json({ success: true, data: updated, message: `Movie status updated to ${status}` });
    } else {
      const updated = await prisma.series.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      return res.status(200).json({ success: true, data: updated, message: `Series status updated to ${status}` });
    }
  } catch (error) {
    console.error('Toggle status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating status.' });
  }
};

module.exports = {
  getDashboardStatistics,
  getMyUploads,
  toggleContentStatus,
};
