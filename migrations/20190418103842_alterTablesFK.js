exports.up = function (knex, Promise) {
  return knex.schema
    .alterTable('menu', table => {
      table.string('pid').unsigned().references('pid').inTable('restaurants').alter()
    })
    .alterTable('dishItems', table => {
      table.integer('dishId').unsigned().references('id').inTable('menu').alter()
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('menu')
    .dropTable('dishItems')
}
