const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidates');
const Position = require('./../models/position');
const User = require('./../models/user');
const { jwtAuthMiddleware } = require('./../jwt');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const { name, pitch, positionId } = req.body;

        if (!name || !positionId) {
            return res.status(400).json({ message: 'Name and positionId are required' });
        }

        // Validate positionId exists
        const position = await Position.findById(positionId);
        if (!position) return res.status(400).json({ message: 'Invalid position ID' });

        const newCandidate = new Candidate({
            name,
            pitch,
            positionId
        });
        const response = await newCandidate.save();

        console.log('Candidate data saved');
        res.status(200).json({ response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update candidate by admin
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        if (updatedCandidateData.positionId) {
            const position = await Position.findById(updatedCandidateData.positionId);
            if (!position) return res.status(400).json({ message: 'Invalid position ID' });
        }

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate Not Found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete candidate by admin
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate Not Found' });
        }

        console.log('Candidate deleted');
        res.status(200).json({ message: 'Record Deletion Successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Cast a vote -> moved to cast multiple vote at once feature.
// router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
//     const candidateID = req.params.candidateID;
//     const userId = req.user.id;

//     try {
//         const candidate = await Candidate.findById(candidateID);
//         if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         if (user.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed to vote' });
//         if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

//         candidate.votes.push({ user: userId });
//         candidate.voteCount++;
//         await candidate.save();

//         user.isVoted = true;
//         await user.save();

//         res.status(200).json({ message: 'Vote recorded successfully' });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// Get vote count summary grouped by position and sorted by vote count descending
router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('positionId').lean();

        const groupedByPosition = {};

        candidates.forEach(candidate => {
            const positionTitle = candidate.positionId?.title || 'Unknown';
            if (!groupedByPosition[positionTitle]) {
                groupedByPosition[positionTitle] = [];
            }

            groupedByPosition[positionTitle].push({
                name: candidate.name,
                pitch: candidate.pitch,
                count: candidate.voteCount
            });
        });

        // Get unique positions with priorities
        const positions = await Position.find({}, { title: 1, priority: 1 }).sort({ priority: 1 }).lean();

        const sortedResult = positions.map(pos => ({
            position: pos.title,
            candidates: (groupedByPosition[pos.title] || []).sort((a, b) => b.count - a.count)
        }));


        return res.status(200).json(sortedResult);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get list of candidates with their positions and pitches
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name pitch positionId')
            .populate('positionId', 'title');
        res.status(200).json(candidates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
