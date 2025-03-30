const Job = require('./models/job');
const WAITLIST_TIMEOUT = 300000;

const handleApply = async (bot, query) => {
    const chatId = query.message.chat.id;
    const applicantId = query.from.id;
    const applicantName = query.from.first_name || 'User';
    const jobId = query.data.split('_')[1];

    let job;

    //Search for the job listing
    try {
        job = await Job.findById(jobId);
    } catch (err) {
        bot.answerCallbackQuery(query.id, { text: 'Job listing not found.' });
        return;
    }

    //limit the number of applicants
    if (job.applicants.length && job.applicants.length >= job.maxApplicants) {
        bot.answerCallbackQuery(query.id, { text: 'Application limit reached!' });
        return;
    }

    // Prevent duplicate applications
    if (job.applicants && job.applicants.some(applicant => applicant.applicantId === applicantId)) {
        bot.answerCallbackQuery(query.id, { text: 'You have already applied!' });
        return;
    }

    // Find an inactive link and assign it to the applicant
    const availableLink = job.links.find(link => link.status === 'inactive');
    if (!availableLink) {
        bot.answerCallbackQuery(query.id, { text: 'No links available right now. Please wait for a spot.' });
        return;
    }
    availableLink.status = 'active';
    job.applicants.push({ applicantId, applicantName, link: availableLink.link });

    //Save the application with applicant details
    try {
        await job.save();
    } catch (err) {
         console.error(err);
         bot.answerCallbackQuery(query.id, { text: 'Could not apply. Please try again.' });
        return;
    }

    // Notify job poster
    bot.sendMessage(job.posterId, `*New Applicant!*\n\n${applicantName} has applied for *${job.jobTitle}*`, { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, `${applicantName}, your application for *${job.jobTitle}* has been sent to the job poster.`);

    //start a time limit for job completion
     setTimeout(async () => {
            const applicant = job.applicants.find(app => app.applicantId === applicantId);
            if (applicant && !forfeitedUsers.has(applicantId)) {
                bot.sendMessage(chatId, 'You didn\'t complete the job in time. You have forfeited the job.');
                availableLink.status = 'inactive';
                job.applicants = job.applicants.filter(app => app.applicantId !== applicantId);
                await job.save();

                // Reassign the link to the next applicant in the waitlist
                if (job.waitlist.length > 0) {
                    const nextWaitlistedApplicant = job.waitlist.shift();
                    job.applicants.push({ ...nextWaitlistedApplicant, link: availableLink.link });
                    bot.sendMessage(nextWaitlistedApplicant.applicantId, `You have been reassigned the link for *${job.jobTitle}*.`);
                    await job.save();
                }
            }
        }, WAITLIST_TIMEOUT);
};
   
module.exports = handleApply;
