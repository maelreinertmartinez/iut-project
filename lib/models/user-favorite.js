'use strict';

const { Model } = require('@hapipal/schwifty');

module.exports = class UserFavorite extends Model {

    static get tableName() {
        return 'user_favorite';
    }

    static get joiSchema() {
        const Joi = require('joi');

        return Joi.object({
            id: Joi.number().integer().greater(0),
            userId: Joi.number().integer().greater(0).required(),
            movieId: Joi.number().integer().greater(0).required(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    static get relationMappings() {
        const Movie = require('./movie');
        const User = require('./user');

        return {
            movie: {
                relation: Model.BelongsToOneRelation,
                modelClass: Movie,
                join: {
                    from: 'user_favorite.movieId',
                    to: 'movie.id'
                }
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'user_favorite.userId',
                    to: 'user.id'
                }
            }
        };
    }
};
