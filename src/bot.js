const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('./config');
const handlePostJob = require('./jobPosting');
const handleApply = require('./jobApplication');

const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });

bot.onText(/\/postjob/, (msg) => handlePostJob(bot, msg));
bot.on('callback_query', (query) => handleApply(bot, query));

module.exports = bot;

