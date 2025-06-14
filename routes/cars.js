const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const carController = require('../controllers/carController');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Public/uploads/cars')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});

// GET all cars with filtering and pagination
router.get('/', carController.getAllCars);

// GET total car count for dashboard card
router.get('/count', carController.getCarCount);

// GET single car by ID
router.get('/:id', carController.getCarById);

// POST new car (protected route)
router.post('/', auth, upload.array('images', 5), carController.createCar);

// PUT update car (protected route)
router.put('/:id', auth, upload.array('images', 5), carController.updateCar);

// DELETE car (protected route)
router.delete('/:id', auth, carController.deleteCar);

module.exports = router;
