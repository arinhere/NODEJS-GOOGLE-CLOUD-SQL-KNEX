require('dotenv').config()// DOTENV has been set for enviornment variables.
// const cors = require('cors')
const express = require('express')// import express to the app
const parser = require('body-parser')// install from npm install --save body-parser

var userRoutes = require('./routes/userRoutes')// This route will handle all the user related calls
var restaurantRoutes = require('./routes/restaurantRoutes')// This route will handle all the user related calls
var commonRoutes = require('./routes/commonRoutes')// This route will handle all the user related calls

const app = express()// making it an express app

app.use(parser.json())// Add it to the app to parse request

// Set the header settings to be used to send and receive data. This is very important. As it will remove CORS error
// app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  next()// Next is important here, as after manilulating the request from client, it will have to send the updated request to the respective methods
})

// Configure view engine to render EJS templates.
// app.set('views', __dirname + '/views')
// app.set('view engine', 'ejs')
app.enable('trust proxy')

// Use application-level middleware for common functionality, including logging, parsing, and session handling.
app.use(require('morgan')('combined'))
app.use(require('cookie-parser')())
app.use(parser.urlencoded({ extended: true }))
app.use(require('express-session')({ secret: process.env.JWT_SECRET_KEY, resave: true, saveUninitialized: true }))

// Mention Routes here
app.use('/api/user', userRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/common', commonRoutes)

module.exports = app // export app
