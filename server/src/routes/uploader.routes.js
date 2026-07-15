const express = require('express');
const router = express.Router();
const uploaderController = require('../controllers/uploader.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// All uploader routes require Uploader or Admin role
router.use(authenticateToken, requireRole('Uploader', 'Admin'));

router.get('/statistics', uploaderController.getDashboardStatistics);
router.get('/my-uploads', uploaderController.getMyUploads);
router.post('/status/:id', uploaderController.toggleContentStatus);

module.exports = router;
