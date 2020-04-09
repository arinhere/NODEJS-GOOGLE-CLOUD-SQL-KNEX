require('dotenv').config()
const express = require('express')
const sgMail = require('@sendgrid/mail')
const commonRoutes = express.Router()

commonRoutes.post('/contact', (req, res, next) => {
  var to = process.env.ADMIN_EMAIL
  var email = req.body.email
  var name = req.body.name
  var message = req.body.message

  // using SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: to,
    from: 'contact-form@menyo.co',
    subject: 'New contact message from ' + name,
    text: 'From: ' + email + '<br/>\n' + message
  }
  sgMail.send(msg)

  return res.status(process.env.RESPONSE_STATUS_OK_CODE).json({
    body: 'Email sent',
    status: process.env.RESPONSE_STATUS_OK
  })
})

module.exports = commonRoutes
