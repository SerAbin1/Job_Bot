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
    links: {
        type: [String],
        required: true
    },
    posterId: { 
        type: Number, 
        required: true
    },
    applicants: [
        {
            userId: Number,
            userName: String,
            appliedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Job', JobSchema);
