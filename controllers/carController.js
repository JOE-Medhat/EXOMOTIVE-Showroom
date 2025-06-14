const Car = require('../models/car');

// Get all cars with filtering and pagination
exports.getAllCars = async (req, res) => {
    try {
        const {
            category,
            status,
            minPrice,
            maxPrice,
            brand,
            page = 1,
            limit = 0
        } = req.query;

        const query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        if (brand) query.brand = brand;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let carsQuery = Car.find(query);

        if (limit > 0) {
            carsQuery = carsQuery
                .limit(limit * 1)
                .skip((page - 1) * limit);
        }

        const cars = await carsQuery.sort({ createdAt: -1 });

        // Replace invalid default image paths before sending to frontend
        cars.forEach(car => {
            if (car.images && Array.isArray(car.images)) {
                car.images = car.images.map(img => {
                    if (img === '/images/Audi/default-car.jpg') {
                        return '/images/Audi/Cars/R8 V10 Performance Front.png';
                    }
                    return img;
                });
            }
        });

        const count = await Car.countDocuments(query);

        res.status(200).json({
            success: true,
            cars,
            totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
            currentPage: page,
            totalCount: count
        });
    } catch (error) {
        console.error('Get all cars error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cars',
            error: error.message
        });
    }
};

// Get car by ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Replace invalid default image paths before sending to frontend
        if (car.images && Array.isArray(car.images)) {
            car.images = car.images.map(img => {
                if (img === '/images/Audi/default-car.jpg') {
                    return '/images/Audi/Cars/R8 V10 Performance Front.png';
                }
                return img;
            });
        }

        res.json({
            success: true,
            car
        });
    } catch (error) {
        console.error('Get car by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car',
            error: error.message
        });
    }
};

// Create new car
exports.createCar = async (req, res) => {
    try {
        const {
            brand,
            model,
            year,
            price,
            engine,
            horsepower,
            torque,
            zeroToSixty,
            topSpeed,
            images,
            noBgImages
        } = req.body;

        const car = new Car({
            brand,
            model,
            year,
            price,
            engine,
            horsepower,
            torque,
            zeroToSixty,
            topSpeed,
            images: images || [],
            noBgImages: noBgImages || []
        });

        await car.save();

        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            car
        });
    } catch (error) {
        console.error('Create car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating car',
            error: error.message
        });
    }
};

// Update car
exports.updateCar = async (req, res) => {
    try {
        const {
            brand,
            model,
            year,
            price,
            engine,
            horsepower,
            torque,
            zeroToSixty,
            topSpeed,
            images,
            noBgImages
        } = req.body;

        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Update fields if provided
        if (brand) car.brand = brand;
        if (model) car.model = model;
        if (year) car.year = year;
        if (price) car.price = price;
        if (engine) car.engine = engine;
        if (horsepower) car.horsepower = horsepower;
        if (torque) car.torque = torque;
        if (zeroToSixty) car.zeroToSixty = zeroToSixty;
        if (topSpeed) car.topSpeed = topSpeed;
        if (images) car.images = images;
        if (noBgImages) car.noBgImages = noBgImages;

        await car.save();

        res.json({
            success: true,
            message: 'Car updated successfully',
            car
        });
    } catch (error) {
        console.error('Update car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating car',
            error: error.message
        });
    }
};

// Delete car
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            message: 'Car deleted successfully'
        });
    } catch (error) {
        console.error('Delete car error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting car',
            error: error.message
        });
    }
};

// Get featured cars
exports.getFeaturedCars = async (req, res) => {
    try {
        const featuredModels = [
            "911 GT2 RS",
            "M4 CSL",
            "812 Competizione",
            "Continental GT"
        ];

        const cars = await Car.find({
            model: { $in: featuredModels.map(model => new RegExp(model, 'i')) }
        });

        res.json({
            success: true,
            cars
        });
    } catch (error) {
        console.error('Get featured cars error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured cars',
            error: error.message
        });
    }
};

// Get total car count for dashboard card
exports.getCarCount = async (req, res) => {
    try {
        const count = await Car.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (err) {
        console.error('Error fetching car count:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch car count', error: err.message });
    }
}; 