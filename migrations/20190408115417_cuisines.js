
exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('cuisines', table => {
            table.increments()
            table.string('cuisine').notNullable()
        })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('cuisines')
};
