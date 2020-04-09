require('dotenv').config()
const debug = require('debug')('node-angular')
const http = require('http')
const appRef = require('./backend/app')// calling a reference to app.js

const normalizePort = val => {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

const onError = error => {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

const onListening = () => {
  const addr = server.address()
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port
  debug('Listening on ' + bind)
}

const port = normalizePort(process.env.PORT || '3000')// If env var is not set, then 3000 will be used
appRef.set('port', port)// set the port for the app.js
const server = http.createServer(appRef)// use createserver to make the call to app reference

server.listen(port)// listen to the server
server.on('error', onError)
server.on('listening', onListening)

// app.listen(process.env['PORT'] || 8080);
