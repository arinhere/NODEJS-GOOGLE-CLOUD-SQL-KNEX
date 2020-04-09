// Update with your config settings.
require('dotenv').config()

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      instanceName: process.env.INSTANCE_CONNECTION_NAME
    }
  }
}
