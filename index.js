const env = require('dotenv').config();
const telegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_TOKEN; 

const bot = new telegramBot(TOKEN, {polling: true});

//reply to any message
/*bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'I do not recognise that command. Please type /help for a list of commands');
});*/

//post job
bot.onText(/\/postjob/, function postJob(msg) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Enter the job title');
    
    //wait for the job title
    bot.once('message', (msg) => {
        const jobTitle = msg.text;
        console.log(jobTitle);

        bot.sendMessage(chatId, 'Enter the maximum number of apllicants');

        //wait for the max number of applicants
        bot.once('message', (msg) => {
            const maxApplicants = msg.text;
            console.log(maxApplicants);
        });
    });
});
