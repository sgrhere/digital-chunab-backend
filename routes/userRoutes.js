const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const { jwtAuthMiddleware, generateToken } = require('./../jwt')


// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body //Assuming the request body contains the user data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate collegeID must have exactly 6 digit
        if (!/^\d{6}$/.test(data.collegeId)) {
            return res.status(400).json({ error: 'College ID must be exactly of 6 digits' });
        }

        // Check if a user with the same collegeID already exists
        const existingUser = await User.findOne({ collegeId: data.collegeId });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same collegeID already exists' });
        }

        // Create a new user document using the Mongoose model
        const newUser = new User(data);

        //Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }

        console.log(JSON.stringify(payload));   // print payload
        const token = generateToken(payload)
        console.log("Token is :", token)    // print generated token

        res.status(200).json({ response: response, token: token })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

//Login Route
router.post('/login', async (req, res) => {
    try {
        //extract username and password from request body
        const { collegeId, password } = req.body;

        // Check if collegeID or password is missing
        if (!collegeId || !password) {
            return res.status(400).json({ error: 'CollegeId and password are required' });
        }

        //find the user by collegeId
        const user = await User.findOne({ collegeId: collegeId });

        // if user does not exist or password doesnot match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        //generate tokens
        const payload = {
            id: user.id
        }
        const token = generateToken(payload)

        //return token as response
        res.json({ token })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

//profile route for changing password
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        //extract user id from decoded token
        const userData = req.user;
        const userId = userData.id;         // extracting user id from userData
        const user = await User.findById(userId);         // finding the person from the above user id
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})



//Update Method
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  //Extract id from the token
        const { currentPassword, newPassword } = req.body;    // extract current and new pass fromm the requested body

        // find the userr by userID
        const user = await User.findById(userId);         // finding the user from the above user id

        // if password doesnot match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        // allow the user to update their password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({ message: 'Password Updated' })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server error' })
    }
})

module.exports = router;