exports.up = function (knex, Promise) {
  return knex.schema.table('restaurants', function (t) {
    t.string('password')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.table('restaurants', function (t) {
    t.dropColumn('password')
  })
}
