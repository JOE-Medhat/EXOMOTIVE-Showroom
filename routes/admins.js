const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');


// Specific routes first
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/init', adminController.createInitialAdmin);

// Profile routes
router.get('/profile', auth, adminController.getProfile);
router.put('/profile', auth, adminController.updateProfile);

// General admin routes
router.get('/', adminController.getAllAdmins);
router.get('/:id', adminController.getAdminById);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
