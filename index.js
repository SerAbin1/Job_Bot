const env = require('dotenv').config();
const telegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN; 

const bot = new telegramBot(TOKEN, {polling: true});

//reply to any message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'I do not recognise that command. Please type /help for a list of commands');
});
