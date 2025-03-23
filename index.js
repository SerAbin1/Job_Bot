const startServer = require('./src/webhook');
const connectDB = require('./src/database');

startServer(); 

connectDB(); 

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

