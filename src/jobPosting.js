const Job = require('./models/job');

const handlePostJob = (bot, msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Enter job details in the format: "Job Title | Max Applicants".');

    bot.on('message', async (msg) => {
        if (msg.from.id !== userId) return;

        const input = msg.text.trim();
        const [jobTitle, maxApplicants] = input.split('|').map(item => item.trim());
        const jobId = Date.now().toString();

        if (!jobTitle || isNaN(maxApplicants) || maxApplicants <= 0) {
            bot.sendMessage(chatId, 'Invalid format. Use: "Job Title | Max Applicants"');
            return;
        }

        const newJob = new Job({ jobId, jobTitle, maxApplicants, posterId: userId });

        try {
            await newJob.save();
            bot.sendMessage(chatId, 'Job posted successfully!');
        }
        catch (err) {
            bot.sendMessage(chatId, 'An error occurred. Please try again.');
        }

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
};

module.exports = { handlePostJob };

