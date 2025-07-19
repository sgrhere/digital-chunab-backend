// models/positions.js
const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    electionId: {
        type: String,
        default: 'election2025'
    },
    maxVotes: {
        type: Number,
        default: 1,
        min: 1
    },
    priority: {
        type: Number,
        required: true,
        default: 0
    }

}, { timestamps: true });

// Compound index to ensure unique title per election
positionSchema.index({ title: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Position', positionSchema);
