// Update with your config settings.
require('dotenv').config()

const Knex = require('knex')

const knex = connect()

function connect () {
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    instanceName: process.env.INSTANCE_CONNECTION_NAME
  }

  if (
    process.env.INSTANCE_CONNECTION_NAME &&
    process.env.NODE_ENV === 'production'
  ) {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
  }

  // Connect to the database
  const knex = Knex({
    client: 'mysql',
    connection: config
  })
  // [END gae_flex_mysql_connect]

  return knex
}

module.exports = knex
