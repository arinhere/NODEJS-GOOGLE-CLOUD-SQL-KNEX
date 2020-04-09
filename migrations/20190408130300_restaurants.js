
exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('restaurants', table => {
            table.increments()
            table.string('name').notNullable()
            table.string('email')
            table.timestamp('contact')
            table.string('location')
            table.string('cuisine')
            table.string('type')
            table.string('provider').notNullable()
            table.string('pid').notNullable()
            table.date('created')
        })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('restaurants')
};
