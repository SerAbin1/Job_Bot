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
bot.setWebHook(`https://9503-175-184-252-178.ngrok-free.app/bot${TOKEN}`);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const jobPosts = [];

// Handle `/postjob` command
bot.onText(/\/postjob/, (msg) => {
    const userId = msg.from.id;

// Handle incoming messages and gather job details
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Skip if the message is from anyone other than the poster
    if (msg.from.id != userId) return;

    const input = msg.text.trim();
    const [jobTitle, maxApplicants] = input.split('|').map(item => item.trim());
    const jobId = Date.now().toString();
    //store job details
    jobPosts.push({ jobId, jobTitle, maxApplicants, posterId: userId });

        // Validate job title and max applicants
    if (!jobTitle || !maxApplicants || isNaN(maxApplicants) || maxApplicants <= 0) {
        bot.sendMessage(chatId, 'Please enter the details in the correct format: "Job Title | Max Applicants". Example: "Software Engineer | 10"');
        return;
    }

    console.log(`Job Title: ${jobTitle}`);
    console.log(`Max Applicants: ${maxApplicants}`);

    // Send the job post message
    const message = `*New Job Alert*\n\n` +
        `*Job Title:* ${jobTitle}\n` +
        `*Max Applicants:* ${maxApplicants}\n\n` +
        `Click below to apply`;

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Apply', callback_data: `apply_${jobId}` }]
            ]
        }
    });
});
});

// Handle application clicks
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userName = query.from.first_name || 'User';
    const jobId = query.data.split('_')[1];

    const job = jobPosts.find(job => job.jobId === jobId);
   if (job) {
        // Notify the job poster privately
        bot.sendMessage(job.posterId, `*New Applicant!*\n\n${userName} has applied for *${job.jobTitle}*`, { parse_mode: 'Markdown' });

        // Acknowledge the applicant
        bot.answerCallbackQuery(query.id, { text: 'Application sent!' });
        bot.sendMessage(chatId, `Your application for *${job.jobTitle}* has been sent to the job poster.`, { parse_mode: 'Markdown' });
    } else {
        bot.answerCallbackQuery(query.id, { text: 'Job listing not found.' });
    }
});
