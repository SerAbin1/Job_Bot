require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const ngrok = require('ngrok');

const TOKEN = process.env.TELEGRAM_TOKEN;
const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(TOKEN, { webHook: true });

app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

async function startNgrok() {
    try {
        const url = await ngrok.connect(PORT);
        console.log(`Ngrok URL: ${url}`);

        const webhookUrl = `${url}/bot${TOKEN}`;
        await bot.setWebHook(webhookUrl);
        console.log(`Webhook set to: ${webhookUrl}`);
    } catch (error) {
        console.error('Error starting ngrok:', error);
        process.exit(1);
    }
}

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await startNgrok();
});

// Handle Telegram commands
bot.onText(/\/postjob/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Enter the job title');

    bot.once('message', (msg) => {
        const jobTitle = msg.text;
        console.log(`Job Title: ${jobTitle}`);

        bot.sendMessage(chatId, 'Enter the maximum number of applicants');

        bot.once('message', (msg) => {
            const maxApplicants = msg.text;
            console.log(`Max Applicants: ${maxApplicants}`);
            const message = `*New Job Alert*\n\n` +
                `*Job Title:* ${jobTitle}\n` +
                `*Max Applicants:* ${maxApplicants}\n\n` +
                `Click below to apply`;

            bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Apply', callback_data: `apply_${jobTitle}` }]
                    ]
                }
            });
        });
    });
});

// Handle application clicks
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userName = query.from.first_name || 'User';

    if (query.data.startsWith('apply_')) {
        const jobTitle = query.data.split('_')[1];

        bot.answerCallbackQuery(query.id, { text: 'Application received!' });

        bot.sendMessage(chatId, `📌 ${userName} has applied for *${jobTitle}*`, { parse_mode: 'Markdown' });
    }
});
