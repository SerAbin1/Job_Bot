const Job = require('./models/job');

const handleApply = async (bot, query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const userName = query.from.first_name || 'User';
    const jobId = query.data.split('_')[1];

    try {
        const job = await Job.findOne({ jobId });

        if (!job) {
            bot.answerCallbackQuery(query.id, { text: 'Job listing not found.' });
            return;
        }

        if (job.applicants.length >= job.maxApplicants) {
            bot.answerCallbackQuery(query.id, { text: 'Application limit reached!' });
            return;
        }

        // Prevent duplicate applications
        if (job.applicants.some(applicant => applicant.userId === userId)) {
            bot.answerCallbackQuery(query.id, { text: 'You have already applied!' });
            return;
        }

        try {
            // Add applicant to database
            job.applicants.push({ userId, userName });
            await job.save();
        } catch (err) {
            console.error(err);
            bot.answerCallbackQuery(query.id, { text: 'Could not apply. Please try again.' });
        return;
        }

        // Notify job poster
        bot.sendMessage(job.posterId, `*New Applicant!*\n\n${userName} has applied for *${job.jobTitle}*`, { parse_mode: 'Markdown' });

        // Confirm to the applicant
        bot.answerCallbackQuery(query.id, { text: 'Application sent!' });
        bot.sendMessage(chatId, `Your application for *${job.jobTitle}* has been sent to the job poster.`, { parse_mode: 'Markdown' });
        bot.sendMessage(chatId, `${job.applicants.length}/${job.maxApplicants} already applied`, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error(err);
        bot.answerCallbackQuery(query.id, { text: 'An error occurred. Please try again.' });
    }
};

module.exports = { handleApply };
