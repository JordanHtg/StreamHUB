const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/series.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', seriesController.getAllSeries);
router.get('/:id', seriesController.getSeriesById);

// Protected uploader / admin routes
router.post('/', authenticateToken, requireRole('Uploader', 'Admin'), seriesController.createSeries);
router.post('/episodes', authenticateToken, requireRole('Uploader', 'Admin'), seriesController.createEpisode);

module.exports = router;
