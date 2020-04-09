exports.up = function (knex, Promise) {
  return knex.schema
    .alterTable('users', table => {
      table.string('name').notNullable().alter()
      table.string('gender')
      table.string('provider').notNullable()
      table.string('pid').notNullable()
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}
