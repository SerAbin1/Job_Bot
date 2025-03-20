const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true
    },
    jobTitle: { 
        type: String,
        required: true
    },
    maxApplicants: {
        type: Number,
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
