const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Define the user schema
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    collegeId :{
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter','admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

//save password in hashed format
userSchema.pre('save', async function(next){
    const person = this;
    //hash the password only if it has been modified (or in new)
    if(!person.isModified('password')) return next();
    try {
        //hash password generation
        const salt = await bcrypt.genSalt(10);      //generate salt

        //hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);

        //override plain password with the hashed one
        person.password = hashedPassword;
        next();
    } catch (error) {
        return next(error)
    }
})

//created a comparePassword function to validate the password
userSchema.methods.comparePassword = async function (candidatePassword){
    try {
        // use bcrypt to compare theprovided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

// Create user model
const User = mongoose.model('User',userSchema);
module.exports= User;