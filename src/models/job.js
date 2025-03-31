const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobTitle: { 
        type: String,
        required: true
    },
    maxApplicants: {
        type: Number,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    links: [
        {
            link: { type: String, required: true },
            status: { type: String, default: 'inactive' }
        }
    ],
    posterId: { 
        type: Number, 
        required: true
    },
    applicants: [
        {
            applicantId: Number,
            applicantName: String,
            link: String,
            appliedAt: { type: Date, default: Date.now }
        }
    ],
    waitlist: [
        {
            applicantId: Number,
            applicantName: String,
            appliedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Job', JobSchema);
