const Job = require('./models/job');
const verify = require('./verify');
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

    //Add to waitlist if max applicants reached
    if (job.applicants.length && job.applicants.length >= job.maxApplicants) {
        bot.answerCallbackQuery(query.id, { text: 'Added to waitlist' });
        job.waitlist.push({ applicantId, applicantName });
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
    //Notify group
    bot.sendMessage(chatId, `${applicantName}, your application for *${job.jobTitle}* has been sent to the job poster.`, { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, `${job.applicants.length}/${job.maxApplicants} applicants have applied for the job.`);
    //Notify the applicant about the job details and send the link
    bot.sendMessage(applicantId, `You have applied for *${job.jobTitle}*\n\n*Description:* ${job.jobDescription}\n\n*Link:* ${availableLink.link}\n\nPlease complete the job within 5 minutes.`, { parse_mode: 'Markdown' });

    //start a time limit for job completion
    setTimeout(async () => {
    const applicant = job.applicants.find(app => app.applicantId === applicantId);
        if (applicant) {
            bot.sendMessage(applicantId, 'You didn\'t complete the job in time. You have forfeited the job.');
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
