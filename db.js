const mongoose =  require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL

const mongoURL = process.env.MONGODB_URL_LOCAL  // replace hotels with your db name (local)

// const mongoURL = process.env.MONGODB_URL;  // (hosted db)


//New technique to setup mongodb connection
mongoose.connect(mongoURL)

// Get the default connection
// Mongoose maintains a default connection object representing the mongoDB connection.
const db = mongoose.connection;

// Define event listeners for database connection
 db.on('connected',() =>{
    console.log("Connected to mongoDB server");
 })

  db.on('error',(err) =>{
    console.log("MongoDB connection error:", err);
 })

  db.on('disconnected',() =>{
    console.log("MongoDB disconnected");
 })

 //Export the database connection

 module.exports = db