const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true   // Prevent multiple votes from same user
    },
    votes: [
        {
            position: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Position',
                required: true
            },
            candidate: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Candidate',
                required: true
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Vote', voteSchema);
