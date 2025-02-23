'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.createTable('user_favorite', (table) => {
            table.increments('id').primary();
            table.integer('userId').unsigned().notNull().references('user.id').onDelete('CASCADE');
            table.integer('movieId').unsigned().notNull().references('movie.id').onDelete('CASCADE');
            table.timestamp('createdAt').notNull().defaultTo(knex.fn.now());
            table.timestamp('updatedAt').notNull().defaultTo(knex.fn.now());
            
            // Ensure a user can't favorite the same movie twice
            table.unique(['userId', 'movieId']);
        });
    },

    async down(knex) {
        await knex.schema.dropTable('user_favorite');
    }
};
