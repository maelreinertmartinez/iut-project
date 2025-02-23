'use strict';

module.exports = {
    async up(knex) {
        await knex.schema.createTable('movie', (table) => {
            table.increments('id').primary();
            table.string('title').notNull();
            table.text('description').notNull();
            table.date('releaseDate').notNull();
            table.string('director').notNull();
            table.timestamp('createdAt').notNull().defaultTo(knex.fn.now());
            table.timestamp('updatedAt').notNull().defaultTo(knex.fn.now());
        });
    },
    
    async down(knex) {
        await knex.schema.dropTable('movie');
    }
};
