const mongoose = require('mongoose');
const { User } = require('./models/user');

async function updateInactiveUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/car_dealership', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Update all users with 'inactive' status to 'Active'
        const result = await User.updateMany(
            { status: 'inactive' },
            { $set: { status: 'Active' } }
        );

        console.log(`Updated ${result.modifiedCount} users from 'inactive' to 'Active'`);
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

updateInactiveUsers(); 