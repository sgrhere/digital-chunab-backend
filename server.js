const express = require('express')
const app = express()
const db = require('./db')
require('dotenv').config();

const bodyParser = require('body-parser')
app.use(bodyParser.json());  // doing this, it will store converted data into req.body 
const PORT = process.env.PORT || 3000;


//import routers
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const positionRoutes = require('./routes/positionRoutes');
const voteRoutes = require('./routes/voteRoutes')

//use routers
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);
app.use('/position', positionRoutes);
app.use('/vote', voteRoutes);


// Listen to port
app.listen(PORT, () => {
    console.log("Server is live & listening at port 3000");
})
