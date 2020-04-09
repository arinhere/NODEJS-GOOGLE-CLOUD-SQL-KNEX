require('dotenv').config()
const db = require('../database')
const checkAuth = require('../middleware/authValidator')
const express = require('express')
const jwt = require('jsonwebtoken')
var session = require('express-session')
const sgMail = require('@sendgrid/mail')

const userRoutes = express.Router()
var passport = require('passport')
var FbStrategy = require('passport-facebook').Strategy
var InstagramStrategy = require('passport-instagram').Strategy

// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

// Configure the Facebook strategy for use by Passport.
passport.use(new FbStrategy({
  clientID: process.env['FACEBOOK_CLIENT_ID'],
  clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
  callbackURL: process.env.SOCIAL_RETURN_URL + 'api/user/login/facebook/return',
  // callbackURL: '/api/user/login/facebook/return',
  proxy: true,
  profileFields: ['id', 'displayName', 'email']
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}))

// Strategy for instagram
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: process.env.SOCIAL_RETURN_URL + 'api/user/login/instagram/return'
  // callbackURL: '/api/user/login/instagram/return'
},
function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}))

// Login using facebook
// Initialize Passport and restore authentication state, if any, from the session.
userRoutes.use(passport.initialize())
userRoutes.use(passport.session())
// var session_var

// userRoutes.get('/login/facebook', passport.authenticate('facebook'));

userRoutes.get('/login/facebook', function authenticateFacebook (req, res, next) {
  session.userType = req.query.type
  next()
},
passport.authenticate('facebook'))

userRoutes.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    var tableName = getTableName(session.userType)

    db(tableName)
      .where({ pid: req.user['_json'].id })
      .then(result => {
        if (result.length > 0) {
          // Second variable is set for redirection true or false. Which is true for restaurant
          if (session.userType === 'customer') {
            // return res.redirect(process.env.CLIENT_URL + 'p/' + session.userType + '/profile/' + req.user['_json'].id)
            return res.redirect(process.env.CLIENT_URL + 'p/customer/profile/' + req.user['_json'].id)
          } else {
            return res.redirect(process.env.CLIENT_URL + 'p/' + session.userType + '/profile/' + req.user['_json'].id + '/true')
          }
        } else { // If user dont exists
          var email = ''
          if (req.user['_json'].email) {
            email = req.user['_json'].email
          }
          var data = {
            name: req.user['_json'].name,
            email: email,
            type: session.userType,
            provider: req.user['provider'],
            pid: req.user['_json'].id,
            created: new Date()
          }

          insertIntoDatabase(data, req.user['_json'].id, session.userType, tableName, res)
        }
      })
  })

userRoutes.get('/login/instagram', function authenticateInsta (req, res, next) {
  session.userType = req.query.type
  next()
},

passport.authenticate('instagram'))

userRoutes.get('/login/instagram/return',
  passport.authenticate('instagram', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    var tableName = getTableName(session.userType)

    db(tableName)
      .where({ pid: req.user['id'] })
      .then(result => {
        if (result.length > 0) {
          // Second variable is set for redirection true or false. Which is true for restaurant
          if (session.userType === 'customer') {
            // return res.redirect(process.env.CLIENT_URL + 'p/' + session.userType + '/profile/' + req.user['id'])
            return res.redirect(process.env.CLIENT_URL + 'p/welcome')
          } else {
            return res.redirect(process.env.CLIENT_URL + 'p/' + session.userType + '/profile/' + req.user['id'] + '/true')
          }
        } else { // If user dont exists
          var data = {
            name: req.user['displayName'],
            type: session.userType,
            provider: req.user['provider'],
            pid: req.user['id'],
            created: new Date()
          }

          insertIntoDatabase(data, req.user['id'], session.userType, tableName, res)
        }
      })
  })

userRoutes.get('/login/facebook/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
      body: req.user
    })
  })

// Get Profile Details
userRoutes.get('/login/getProfile/:type/:pid', (req, res, next) => {
  if (req.params.pid && req.params.type) {
    var token = jwt.sign({ userId: req.params.pid }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h'
    })

    var table = getTableName(req.params.type)

    db(table).where({ pid: req.params.pid })
      .then(result => {
        return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
          token: token,
          body: result,
          status: process.env.RESPONSE_STATUS_OK
        })
      })
      .catch(err => {
        return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
          body: err,
          status: process.env.RESPONSE_STATUS_BAD
        })
      })
  } else {
    return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
      body: 'No user id received',
      status: process.env.RESPONSE_STATUS_BAD
    })
  }
})

// Protected Route for updating customer
userRoutes.put('/update/customer', checkAuth, (req, res, next) => {
  var data = {
    email: req.body.email,
    dob: new Date(req.body.date),
    gender: req.body.gender
  }

  db('users')
    .where({ pid: req.body.pid })
    .update(data)
    .then(function (data) {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        status: process.env.RESPONSE_STATUS_OK,
        body: data
      })
    })
    .catch(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        status: process.env.RESPONSE_STATUS_BAD,
        body: err
      })
    })
})

function getTableName (userType) {
  if (userType === 'customer') {
    return 'users'
  } else {
    return 'restaurants'
  }
}

function insertIntoDatabase (data, id, userType, tableName, res) {
  db(tableName)
    .insert(data)
    .then(returnData => {
      if (data['email']) { // if email id exists then send welcome email to user
        sendEmail(data['name'], data['email'])
      }

      // Second variable is set for redirection true or false. Which is true for restaurant
      if (userType === 'customer') {
        return res.redirect(process.env.CLIENT_URL + 'p/' + userType + '/profile/' + id)
      } else {
        return res.redirect(process.env.CLIENT_URL + 'p/' + userType + '/profile/' + id + '/false')
      }
    })
    .catch(err => {
      console.log(err)
      // Second variable is set for redirection true or false
      if (userType === 'customer') {
        return res.redirect(process.env.CLIENT_URL + 'p/' + userType + '/profile/error')
      } else {
        return res.redirect(process.env.CLIENT_URL + 'p/' + userType + '/profile/error/false')
      }
    })

  delete session.userType
}

function sendEmail (name, email) {
  var to = email
  var from = process.env.ADMIN_EMAIL

  // using SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: to,
    from: from,
    subject: 'Welcome to Menyo',
    text: 'Hello ' + name + ', Welcome to Menyo.'
  }
  sgMail.send(msg)
}

module.exports = userRoutes
