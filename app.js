const { config } = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');

require('dotenv/config');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins in development
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

// Add a global request logger to see what's happening
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Import routes
const adminsRoutes = require('./routes/admins');
const usersRoutes = require('./routes/users');
const carsRoutes = require('./routes/cars');
const messagesRoutes = require('./routes/messages');
const defaultImageRoutes = require('./routes/defaultImage');

// API Routes - These must be BEFORE static file serving
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/admins', adminsRoutes);
app.use('/api/v1/cars', carsRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/default-image', defaultImageRoutes);

// Serve static files from the Public directory
app.use(express.static(path.join(__dirname, 'Public')));

// View Routes
app.use('/', require('./routes/views'));

// Test route for logging
app.get('/test', (req, res) => {
    console.log('Test route hit!');
    res.send('Hello from test!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!'
    });
});

// Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017', {
    dbName: 'EXOMOTIVE_DB'
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => console.error("Could not connect to MongoDB", err.message));

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
