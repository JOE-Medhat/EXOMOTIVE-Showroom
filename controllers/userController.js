const { User } = require('../models/user');
const Car = require('../models/car');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: 'user',
        });

        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Send token with response
        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token, // ← this is what frontend expects
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// Update user profile
exports.updateUser = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user && req.user._id ? req.user._id : req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update basic info
        if (name) user.name = name;
        if (email) user.email = email;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            user.password = newPassword;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password.', error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get total user count
exports.getUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch user count', error: err.message });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get user's saved cars
exports.getSavedCars = async (req, res) => {
    try {
        const userId = req.user && req.user._id ? req.user._id : req.params.id;
        console.log('[userController] getSavedCars: Attempting to find user with ID:', userId);
        const user = await User.findById(userId).populate({
            path: 'savedCars',
            select: 'brand model year price images' // Explicitly select the fields we need
        });
        console.log('[userController] getSavedCars: User found in DB:', !!user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Replace invalid default image paths before sending to frontend
        const cars = user.savedCars.map(car => {
            if (car.images && Array.isArray(car.images)) {
                car.images = car.images.map(img => {
                    // Remove extra double quotes and handle default image path
                    let cleanedImg = img.replace(/^"|"$/g, ''); // Remove leading/trailing quotes
                    if (cleanedImg === '/images/Audi/default-car.jpg') {
                        return '/images/Audi/Cars/R8 V10 Performance Front.png';
                    }
                    return cleanedImg;
                });
            }
            return car;
        });

        res.status(200).json({ success: true, cars });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Save a car
exports.saveCar = async (req, res) => {
    try {
        const userId = req.user && req.user._id ? req.user._id : req.params.id;
        const carId = req.params.carId;

        if (!carId) {
            return res.status(400).json({ success: false, message: 'Car ID is required' });
        }

        console.log('[userController] saveCar: Attempting to find user with ID:', userId);
        const user = await User.findById(userId);
        console.log('[userController] saveCar: User found in DB:', !!user);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if car exists before saving
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        if (!user.savedCars.includes(carId)) {
            user.savedCars.push(carId);
            await user.save();
            console.log('[userController] saveCar: Car saved successfully for user:', userId);
        } else {
            console.log('[userController] saveCar: Car already saved for user:', userId);
        }

        res.status(200).json({ success: true, message: 'Car saved successfully' });
    } catch (err) {
        console.error('[userController] saveCar error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Remove a saved car
exports.removeSavedCar = async (req, res) => {
    try {
        const userId = req.user && req.user._id ? req.user._id : req.params.id;
        const carId = req.params.carId;

        if (!carId) {
            return res.status(400).json({ success: false, message: 'Car ID is required' });
        }

        console.log('[userController] removeSavedCar: Attempting to find user with ID:', userId);
        const user = await User.findById(userId);
        console.log('[userController] removeSavedCar: User found in DB:', !!user);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const initialLength = user.savedCars.length;
        user.savedCars = user.savedCars.filter(id => id.toString() !== carId);
        
        if (user.savedCars.length === initialLength) {
            console.log('[userController] removeSavedCar: Car was not in saved cars for user:', userId);
            return res.status(404).json({ success: false, message: 'Car was not in saved cars' });
        }

        await user.save();
        console.log('[userController] removeSavedCar: Car removed successfully for user:', userId);

        res.status(200).json({ success: true, message: 'Car removed from saved cars' });
    } catch (err) {
        console.error('[userController] removeSavedCar error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// Update any users with 'inactive' status to 'Active'
exports.updateInactiveUsers = async (req, res) => {
    try {
        const result = await User.updateMany(
            { status: 'inactive' },
            { $set: { status: 'Active' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users from 'inactive' to 'Active'`);
        res.status(200).json({ 
            success: true, 
            message: `Updated ${result.modifiedCount} users from 'inactive' to 'Active'` 
        });
    } catch (err) {
        console.error('Error updating inactive users:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Initialize function to update inactive users
exports.initializeUserStatuses = async () => {
    try {
        const result = await User.updateMany(
            { status: 'inactive' },
            { $set: { status: 'Active' } }
        );
        console.log(`[userController] Updated ${result.modifiedCount} users from 'inactive' to 'Active'`);
    } catch (err) {
        console.error('[userController] Error updating inactive users:', err);
    }
};

// Call the initialization function
exports.initializeUserStatuses();


