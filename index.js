require('dotenv').config();
const { app, startServer } = require('./src/webhook');
const connectDB = require('./src/database');

startServer(); // Start Express server

connectDB(); // Connect to MongoDB

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

