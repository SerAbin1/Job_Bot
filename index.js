require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 8080;
const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(TOKEN, { webHook: true });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});
bot.setWebHook(`https://f997-14-139-183-121.ngrok-free.app/bot${TOKEN}`);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const userState = {};
// Handle Telegram commands
bot.onText(/\/postjob/, (msg) => {
    const chatId = msg.chat.id;
    
    // Initialize user state if not already set
    if (!userState[chatId]) {
        userState[chatId] = { step: 'jobTitle' };
    }

    // Start the job posting process
    if (userState[chatId].step === 'jobTitle') {
        bot.sendMessage(chatId, 'Enter the job title');
        userState[chatId].step = 'waitingForJobTitle';
    } else if (userState[chatId].step === 'maxApplicants') {
        bot.sendMessage(chatId, 'Enter the maximum number of applicants');
        userState[chatId].step = 'waitingForMaxApplicants';
    }
});

// Handle incoming messages and gather job details
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Skip if the message is from the bot itself
    if (msg.from.is_bot) return;

    // Handle job title input
    if (userState[chatId] && userState[chatId].step === 'waitingForJobTitle') {
        const jobTitle = msg.text;
        console.log(`Job Title: ${jobTitle}`);

        // Save the job title in userState
        userState[chatId].jobTitle = jobTitle;

        // Move to next step and prompt for max applicants
        userState[chatId].step = 'maxApplicants';
        bot.sendMessage(chatId, 'Enter the maximum number of applicants');
    }
    
    // Handle max applicants input
    else if (userState[chatId] && userState[chatId].step === 'waitingForMaxApplicants') {
        const maxApplicants = msg.text;
        console.log(`Max Applicants: ${maxApplicants}`);

        // Save max applicants in userState
        userState[chatId].maxApplicants = maxApplicants;

        // Send job post confirmation
        const message = `*New Job Alert*\n\n` +
            `*Job Title:* ${userState[chatId].jobTitle}\n` +
            `*Max Applicants:* ${maxApplicants}\n\n` +
            `Click below to apply`;

        bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Apply', callback_data: `apply_${userState[chatId].jobTitle}` }]
                ]
            });

        // Reset state after posting the job
        delete userState[chatId];
    }
});

// Handle application clicks
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userName = query.from.first_name || 'User';

    if (query.data.startsWith('apply_')) {
        const jobTitle = query.data.split('_')[1];

        bot.answerCallbackQuery(query.id, { text: 'Application received!' });

        bot.sendMessage(chatId, `${userName} has applied for *${jobTitle}*`, { parse_mode: 'Markdown' });
    }
});
