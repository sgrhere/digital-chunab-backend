const express = require('express');
const router = express.Router();
const Vote = require('../models/vote');
const Candidate = require('../models/candidates');
const Position = require('../models/position');
const User = require('./../models/user')
const { jwtAuthMiddleware } = require('../jwt');

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const voteData = req.body.votes;

        // Check if user already voted
        const existingVote = await Vote.findOne({ voter: userId });
        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        const votesArray = [];

        for (const [positionTitle, candidateIds] of Object.entries(voteData)) {
            // Case-insensitive find for position
            const position = await Position.findOne({ title: new RegExp(`^${positionTitle}$`, 'i') });
            if (!position) {
                return res.status(400).json({ error: `Position '${positionTitle}' not found` });
            }

            // Normalize candidateIds to array
            const candidateIdArray = Array.isArray(candidateIds) ? candidateIds : [candidateIds];

            // Check maxVotes limit
            if (candidateIdArray.length > position.maxVotes) {
                return res.status(400).json({
                    error: `You can only vote ${position.maxVotes} candidate${position.maxVotes > 1 ? 's' : ''} for ${position.title}`
                });
            }

            // Validate candidates belong to positionId (correct field name)
            const validCandidates = await Candidate.find({
                _id: { $in: candidateIdArray },
                positionId: position._id
            });

            if (validCandidates.length !== candidateIdArray.length) {
                return res.status(400).json({
                    error: `Some selected candidates are invalid for position: ${position.title}`
                });
            }

            candidateIdArray.forEach(candidateId => {
                votesArray.push({
                    position: position._id,
                    candidate: candidateId
                });
            });
        }

        // Save the vote
        const vote = new Vote({
            voter: userId,
            votes: votesArray
        });
        await vote.save();

        // Increment voteCount for each candidate voted
        await Promise.all(votesArray.map(async ({ candidate }) => {
            await Candidate.findByIdAndUpdate(candidate, { $inc: { voteCount: 1 } });
        }));

        // Mark user as voted
        await User.findByIdAndUpdate(userId, { isVoted: true });

        res.status(201).json({ message: 'Vote cast successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
