// routes/positionRoutes.js
const express = require('express');
const router = express.Router();
const Position = require('../models/position');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// Utility: Check if the user is an admin
const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user && user.role === 'admin';
    } catch (err) {
        return false;
    }
};

//  Create a new position (Admin only)
router.post('/add', jwtAuthMiddleware, async (req, res) => {
    const { title, description, electionId, maxVotes } = req.body;

    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: 'Access denied. Admins only.' });

        const newPosition = new Position({ title, description, electionId, maxVotes });
        await newPosition.save();
        res.status(201).json({ message: 'Position created successfully.', position: newPosition });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Position title must be unique per election.' });
        }
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
});

//  Get all positions
router.get('/', async (req, res) => {
    try {
        const positions = await Position.find();
        res.json(positions);
    } catch (err) {
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
});

//  Get a single position by ID
router.get('/:id', async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);
        if (!position) return res.status(404).json({ error: 'Position not found.' });
        res.json(position);
    } catch (err) {
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
});

//  Update a position (Admin only)
router.put('/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: 'Access denied. Admins only.' });

        const updatedPosition = await Position.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedPosition) return res.status(404).json({ error: 'Position not found.' });
        res.json({ message: 'Position updated successfully.', position: updatedPosition });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Position title must be unique per election.' });
        }
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
});

//  Delete a position (Admin only)
router.delete('/:id', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) return res.status(403).json({ error: 'Access denied. Admins only.' });

        const deleted = await Position.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Position not found.' });
        res.json({ message: 'Position deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.', details: err.message });
    }
});

module.exports = router;
