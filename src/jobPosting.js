const Job = require('./models/job');
const { GROUP_CHAT_ID } = require('./config');
const activeJobPostings = new Map();

const handlePostJob = (bot, msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const key = `${userId}:${chatId}`;

    if (activeJobPostings.has(key)) {
        bot.sendMessage(chatId, 'You are already posting a job. Please finish that first.');
        return;
    }

    bot.sendMessage(chatId, 'Enter job details in the format: "Job Title | Max Applicants | Job Description | Links separated by commas".');
    activeJobPostings.set(key, true);

    bot.once('message', async (msg) => {
        if (msg.from.id !== userId || msg.text.startsWith('/') || msg.chat.id !== chatId) {
            activeJobPostings.delete(key);
            return;
        }

        const input = msg.text.trim();
        const parts = input.split('|').map(item => item.trim());
        console.log('parts:', parts);


        if (!parts || parts.length !== 4) {
            bot.sendMessage(chatId, 'Invalid format. Use: "Job Title | Max Applicants | Job Description | Links separated by commas"');
            activeJobPostings.delete(key);
            return;
        }

        const [jobTitle, maxApplicants, jobDescription, links] = parts;
        //debug
        console.log('Job Title:', jobTitle);
        console.log('Max Applicants:', maxApplicants);
        //debug

        if (!jobTitle || isNaN(maxApplicants) || maxApplicants <= 0 || !jobDescription || !links) {
            bot.sendMessage(chatId, 'Invalid format. Make sure all fields are filled correctly.');
            activeJobPostings.delete(key);
            return;
        }

        console.log('Links:', links);
        //Save the links as an array of objects
        const linksArray = links.split(',').map(link => ({ link: link.trim(), status: 'inactive' }));
        console.log('Links Array:', linksArray);

        const newJob = await Job.create({
            jobTitle,
            maxApplicants,
            jobDescription,
            links: linksArray,
            posterId: userId
        });
        console.log('newJob:', newJob);

        try {
            bot.sendMessage(chatId, 'Job posted successfully!');
        }
        catch (err) {
            console.error('Error saving job:', err);
            bot.sendMessage(chatId, 'Couldn\'t save job. Please try again.');
            activeJobPostings.delete(key);
            return;
        }
        const message = `*New Job Alert*\n\n` +
            `*Job Title:* ${jobTitle}\n` +
            `*Description:* ${jobDescription}\n` +
            `*Max Applicants:* ${maxApplicants}\n\n` +
            `Click below to apply`;

        bot.sendMessage(GROUP_CHAT_ID, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Apply', callback_data: `apply_${newJob._id}` }]
                ]
            }
        });
        activeJobPostings.delete(key);
    });
};

module.exports = handlePostJob;

