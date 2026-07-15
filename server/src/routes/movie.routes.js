const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Protected user routes
router.post('/:id/like', authenticateToken, movieController.toggleLike);

// Protected uploader / admin routes
router.post('/', authenticateToken, requireRole('Uploader', 'Admin'), movieController.createMovie);
router.put('/:id', authenticateToken, requireRole('Uploader', 'Admin'), movieController.updateMovie);
router.delete('/:id', authenticateToken, requireRole('Uploader', 'Admin'), movieController.deleteMovie);

module.exports = router;
