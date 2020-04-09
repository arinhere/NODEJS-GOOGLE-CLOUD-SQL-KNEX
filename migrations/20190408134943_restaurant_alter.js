exports.up = function (knex, Promise) {
    return knex.schema
        .alterTable('restaurants', table => {
            table.string('contact').alter()
        })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('restaurants')
}
