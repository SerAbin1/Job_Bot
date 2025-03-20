require('dotenv').config();
const { app, startServer } = require('./src/webhook');
const { bot } = require('./src/bot');

startServer(); // Start Express server
