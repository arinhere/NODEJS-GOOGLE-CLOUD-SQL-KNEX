require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    var token = req.headers.authorization.split(' ')[1] // Stripping Bearer out of the token
    var decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.userData = { userId: decodedToken.userId }// Get the logged in user data and save it to request params by adding new field userData
    next()
  } catch (err) {
    return res.status(process.env.RESPONSE_STATUS_UNAUTHORIZED_CODE).json({
      message: process.env.RESPONSE_STATUS_UNAUTHORIZED
    })
  }
}
