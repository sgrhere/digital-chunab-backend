const mongoose = require('mongoose');
// const bcrypt = require('bcrypt')
// Define the user schema

const candidateSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    pitch:{
        type: String,
        required: true
    },
    positionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Position', 
        required: true 
    },
    electionId:{
        type: String,
        default: 'election2025'
    },
    // votes: [       //-> shiftedin vote.js model
    //     {
    //         user :{
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'User',
    //             required: true
    //         },
    //         votedAt:{
    //             type: Date,
    //             default: Date.now()
    //         }
    //     }
    // ],

    voteCount: {
        type: Number,
        default: 0
    }
});

// Create Person model
const Candidate = mongoose.model('Candidate',candidateSchema);
module.exports= Candidate;