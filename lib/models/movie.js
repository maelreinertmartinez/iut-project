'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {
        return 'movie';
    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().min(1).max(255).required(),
            description: Joi.string().required(),
            releaseDate: Joi.date().required(),
            director: Joi.string().max(255).required(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    static get relationMappings() {
        const UserFavorite = require('./user-favorite');

        return {
            userFavorites: {
                relation: Model.HasManyRelation,
                modelClass: UserFavorite,
                join: {
                    from: 'movie.id',
                    to: 'user_favorite.movieId'
                }
            }
        };
    }

    $beforeInsert(queryContext) {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    $beforeUpdate(opt, queryContext) {
        this.updatedAt = new Date();
    }
}
