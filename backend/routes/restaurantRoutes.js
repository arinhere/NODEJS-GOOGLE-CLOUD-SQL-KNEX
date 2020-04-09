require('dotenv').config()
var bcrypt = require('bcrypt')

const db = require('../database')
const checkAuth = require('../middleware/authValidator')
const express = require('express')
const restaurantRoutes = express.Router()

// Retaurant normal registration
restaurantRoutes.post('/new', (req, res, next) => {
  db('restaurants')
    .where({ email: req.body.email })
    .then(result => {
      if (result.length > 0) {
        return res.status(process.env.RESPONSE_STATUS_INVALID_CODE).json({
          body: 'Email ID already exists',
          status: process.env.RESPONSE_STATUS_INVALID
        })
      } else {
        var pid = generatePID()
        var data = {
          name: req.body.name,
          email: req.body.email,
          type: 'restaurant',
          provider: 'local',
          pid: pid,
          created: new Date(),
          password: bcrypt.hashSync(req.body.password, 10)
        }

        db('restaurants')
          .insert(data)
          .then(returnData => {
            if (returnData) {
              return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
                body: { pid: pid },
                status: process.env.RESPONSE_STATUS_OK
              })
            }
          })
          .catch(err => {
            return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
              body: err,
              status: process.env.RESPONSE_STATUS_BAD
            })
          })
      }
    })
})

// normal login using email & password
restaurantRoutes.post('/login', (req, res, next) => {
  db('restaurants')
    .where({ email: req.body.email })
    .then(async result => {
      if (bcrypt.compareSync(req.body.password, result[0].password)) {
        return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
          body: { pid: result[0].pid },
          status: process.env.RESPONSE_STATUS_OK
        })
      } else {
        return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
          body: 'Invalid login credentials',
          status: process.env.RESPONSE_STATUS_OK
        })
      }
    })
    .catch(err => {
      return res.status(process.env.RESPONSE_STATUS_INVALID_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_INVALID
      })
    })
})

// Function to generate PID for restaurants
function generatePID () {
  return Math.random().toString(36).substring(2, 17)
}

restaurantRoutes.get('/listCuisines', checkAuth, (req, res, next) => {
  db('cuisines')
    .then(result => {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
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
})

// Update profile information
restaurantRoutes.post('/profile/update', checkAuth, (req, res, next) => {
  var data = {
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    location: req.body.location,
    cuisine: req.body.cuisine,
    location_formatted_address: req.body.location_formatted_address,
    location_url: req.body.location_url
  }

  db('restaurants')
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
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// Create new menu item
restaurantRoutes.post('/menu/create', checkAuth, (req, res, next) => {
  var data = {
    pid: req.body.pid,
    dishName: req.body.dishName,
    mealType: req.body.mealType
  }

  db('menu')
    .returning('id')
    .insert(data)
    .then(function (data) {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        status: process.env.RESPONSE_STATUS_OK,
        body: data
      })
    })
    .catch(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// Insert dish item into table
restaurantRoutes.post('/dishItems/insert', checkAuth, (req, res, next) => {
  db('dishItems')
    .returning('*')
    .insert(req.body)
    .then(function (data) {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        status: process.env.RESPONSE_STATUS_OK,
        body: data
      })
    })
    .catch(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// Remove menu item
restaurantRoutes.delete('/menu/remove/:id', checkAuth, (req, res, next) => {
  try {
    db('menu')
      .where({ id: req.params.id })
      .del()
      .then(async r => {
        return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
          body: 'Menu item removed',
          status: process.env.RESPONSE_STATUS_OK
        })
      })
  } catch (err) {
    return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
      body: err,
      status: process.env.RESPONSE_STATUS_BAD
    })
  }
})

// List menu items based on restaurant
restaurantRoutes.get('/menu/list/:pid', checkAuth, (req, res, next) => {
  db('menu')
    .where({ pid: req.params.pid })
    .orderBy('created', 'desc')
    .then(result => {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        body: result,
        status: process.env.RESPONSE_STATUS_OK
      })
    })
    .error(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// Update menu item
restaurantRoutes.put('/menu/update', checkAuth, (req, res, next) => {
  var data = {
    dishName: req.body.dishName,
    mealType: req.body.mealType
  }

  db('menu')
    .where({ id: req.body.id })
    .update(data)
    .then(function (data) {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        status: process.env.RESPONSE_STATUS_OK,
        body: data
      })
    })
    .catch(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// Update dish items according to menu
restaurantRoutes.put('/dishItems/update/:dishId', checkAuth, (req, res, next) => {
  var dishId = req.params.dishId

  db('dishItems')
    .where({ dishId: dishId })
    .del()
    .then(result => {
      if (result) {
        db('dishItems')
          .returning('*')
          .insert(req.body)
          .then(function (data) {
            return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
              status: process.env.RESPONSE_STATUS_OK,
              body: data
            })
          })
          .catch(err => {
            return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
              body: err,
              status: process.env.RESPONSE_STATUS_BAD
            })
          })
      }
    })
})

// Get dish details
restaurantRoutes.get('/menu/getDish/:id', checkAuth, (req, res, next) => {
  db('menu')
    .where({ 'menu.id': req.params.id })
    .join('dishItems', 'menu.id', '=', 'dishItems.dishId')
    .then(result => {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        body: result,
        status: process.env.RESPONSE_STATUS_OK
      })
    })
    .error(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// get dish items based on dish selected
restaurantRoutes.get('/menu/dishItems/:dishId', checkAuth, (req, res, next) => {
  db('dishItems')
    .where({ 'dishId': req.params.dishId })
    .then(result => {
      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        body: result,
        status: process.env.RESPONSE_STATUS_OK
      })
    })
    .error(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

// generate dish matrix
restaurantRoutes.get('/menu/dishMatrix/:pid', checkAuth, (req, res, next) => {
  var dishMatrix = []

  db('menu')
    .where({ 'pid': req.params.pid })
    .then(async result => {
      try {
        for (var i = 0; i < result.length; i++) {
          const el = result[i]
          const items = await db('dishItems').where({ 'dishId': el.id })
          dishMatrix.push({
            dishId: el.id,
            dishName: el.dishName,
            dishItems: items
          })
        }
      } catch (e) {
        return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
          status: process.env.RESPONSE_STATUS_BAD
        })
      }

      return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
        body: dishMatrix,
        status: process.env.RESPONSE_STATUS_OK
      })
    })
    .error(err => {
      return res.status(process.env.RESPONSE_STATUS_BAD_CODE).json({
        body: err,
        status: process.env.RESPONSE_STATUS_BAD
      })
    })
})

module.exports = restaurantRoutes
