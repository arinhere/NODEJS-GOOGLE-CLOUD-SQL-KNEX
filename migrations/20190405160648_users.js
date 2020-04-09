exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('users', table => {
      table.increments()
      table.string('name')
      table.string('email')
      table.timestamp('dob')
      table.string('password')
      table.string('type')
      table.date('created')
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}
