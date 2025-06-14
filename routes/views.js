const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const auth = require('../middleware/auth');

// Home page
router.get('/', async (req, res) => {
    try {
        const featuredCars = await Car.find().limit(6);
        res.render('home', {
            title: 'Home - Car Dealership',
            featuredCars
        });
    } catch (error) {
        console.error('Error fetching featured cars:', error);
        res.render('home', {
            title: 'Home - Car Dealership',
            featuredCars: []
        });
    }
});

// Models page
router.get('/models', async (req, res) => {
    try {
        const cars = await Car.find();
        res.render('models', {
            title: 'Models - Car Dealership',
            cars
        });
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.render('models', {
            title: 'Models - Car Dealership',
            cars: []
        });
    }
});

// Car details page
router.get('/car/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).render('error', {
                title: 'Car Not Found',
                message: 'The requested car could not be found.'
            });
        }
        res.render('car-details', {
            title: `${car.brand} ${car.model} - Car Dealership`,
            car
        });
    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading car details.'
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - Car Dealership'
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us - Car Dealership'
    });
});

// Login page
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login - Car Dealership'
    });
});

// Register page
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register - Car Dealership'
    });
});

// Profile page (protected)
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('savedCars');
        res.render('profile', {
            title: 'My Profile - Car Dealership',
            user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading profile.'
        });
    }
});

module.exports = router; 