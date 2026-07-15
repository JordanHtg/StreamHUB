const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRoutes = require('./auth.routes');
const movieRoutes = require('./movie.routes');
const seriesRoutes = require('./series.routes');
const uploaderRoutes = require('./uploader.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/series', seriesRoutes);
router.use('/uploader', uploaderRoutes);
router.use('/user', userRoutes);

// Public Genres Endpoint
router.get('/genres', async (req, res) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, count: genres.length, data: genres });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching genres.' });
  }
});

// Public Categories Endpoint
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching categories.' });
  }
});

// Public Banners Endpoint (Hero Carousel)
router.get('/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching banners.' });
  }
});

// Health Check Endpoint
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'StreamHUB API is operational and running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
