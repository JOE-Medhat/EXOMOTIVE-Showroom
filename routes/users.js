const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Specific routes FIRST
router.post('/register', userController.register);
router.post('/login', userController.login);

// Authenticated routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateUser);

// Saved Cars routes (protected)
router.get('/:id/saved-cars', auth, userController.getSavedCars);
router.post('/:id/saved-cars/:carId', auth, userController.saveCar);
router.delete('/:id/saved-cars/:carId', auth, userController.removeSavedCar);

// Admin routes
router.get('/', userController.getAllUsers);
router.get('/count', userController.getUserCount);

// Update inactive users route
router.post('/update-inactive-users', auth, userController.updateInactiveUsers);

// ❗ These must come last
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
