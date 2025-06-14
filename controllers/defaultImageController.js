const DefaultImage = require('../models/defaultImage');

// Get active default image
exports.getDefaultImage = async (req, res) => {
    try {
        const defaultImage = await DefaultImage.findOne({ type: 'car', isActive: true });
        if (!defaultImage) {
            return res.status(404).json({
                success: false,
                message: 'No default image found'
            });
        }
        res.json({
            success: true,
            defaultImage: defaultImage.imageUrl
        });
    } catch (error) {
        console.error('Get default image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching default image',
            error: error.message
        });
    }
};

// Set new default image (admin only)
exports.setDefaultImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        // Deactivate all current default images
        await DefaultImage.updateMany(
            { type: 'car', isActive: true },
            { isActive: false }
        );

        // Create new default image
        const defaultImage = new DefaultImage({
            type: 'car',
            imageUrl,
            isActive: true
        });

        await defaultImage.save();

        res.status(201).json({
            success: true,
            message: 'Default image updated successfully',
            defaultImage
        });
    } catch (error) {
        console.error('Set default image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting default image',
            error: error.message
        });
    }
}; 