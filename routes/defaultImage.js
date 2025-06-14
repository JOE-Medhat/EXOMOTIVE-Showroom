const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const defaultImageController = require('../controllers/defaultImageController');

// GET default image
router.get('/', defaultImageController.getDefaultImage);

// POST new default image (admin only)
router.post('/', auth, defaultImageController.setDefaultImage);

module.exports = router; 