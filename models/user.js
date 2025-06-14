const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Blocked', 'inactive'],
        default: 'Active'
    },
    savedCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
}, { collection: 'Users', versionKey: false });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log('Comparing passwords:');
    console.log('Candidate Password (masked):', candidatePassword ? '********' : 'N/A');
    console.log('Stored Hashed Password (masked):', this.password ? this.password.substring(0, 10) + '...' : 'N/A');
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Bcrypt comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error during password comparison:', error);
        throw error;
    }
};

// Generate auth token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { userId: this._id, isAdmin: false }, // User is not an admin
        process.env.JWT_SECRET || 'your_jwt_secret_key', // Use environment variable or fallback
        { expiresIn: '1h' } // Set token expiration to 1 hour
    );
    return token;
};

exports.User = mongoose.model('User', userSchema);
