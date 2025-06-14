const mongoose = require('mongoose');

const defaultImageSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['car', 'brand'],
        default: 'car'
    },
    imageUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'DefaultImages', versionKey: false });

// Update the updatedAt timestamp before saving
defaultImageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DefaultImage', defaultImageSchema); 