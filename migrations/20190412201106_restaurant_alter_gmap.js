exports.up = function (knex, Promise) {
  return knex.schema
    .alterTable('restaurants', table => {
      table.string('location_formatted_address'),
      table.string('location_url')
    })

  return knex.schema
    .alterTable('menu', table => {
      table.foreign('pid').references('restaurants.pid').alter()
    })

  return knex.schema
    .alterTable('dishItems', table => {
      table.foreign('dishId').references('menu.id').alter()
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('restaurants')
  return knex.schema.dropTable('menu')
  return knex.schema.dropTable('dishItems')
}
