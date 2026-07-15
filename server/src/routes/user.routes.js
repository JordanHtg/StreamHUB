const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/watchlist', userController.getWatchlist);
router.post('/watchlist', userController.toggleWatchlist);
router.get('/favorites', userController.getFavorites);
router.post('/progress', userController.saveWatchProgress);
router.post('/comments', userController.addComment);
router.post('/ratings', userController.addRating);
router.delete('/account', userController.deleteAccount);

module.exports = router;
