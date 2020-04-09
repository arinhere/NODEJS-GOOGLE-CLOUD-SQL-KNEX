
exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('menu', table => {
            table.increments()
            table.string('pid').notNullable()// restaurant provider id
            table.string('dishName').notNullable()
            table.string('mealType').notNullable()
            table.timestamp('created')
        })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('menu')
};
