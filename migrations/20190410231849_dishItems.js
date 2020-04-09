
exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('dishItems', table => {
            table.increments()
            table.integer('dishId').notNullable()// dish id from menu table
            table.string('itemName').notNullable()
            table.string('amount').notNullable()
            table.string('counter').notNullable()
            table.timestamp('created')
        })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('dishItems')
};
