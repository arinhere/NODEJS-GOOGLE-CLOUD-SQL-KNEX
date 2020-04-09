exports.up = function (knex, Promise) {
  return knex.schema
    .alterTable('users', table => {
      table.date('dob').alter()
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}
