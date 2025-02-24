'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');

module.exports = [
    {
        method: 'GET',
        path: '/movies',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api'],
            handler: async (request, h) => {
                const { movieService } = request.services();
                return await movieService.findAll();
            }
        }
    },
    {
        method: 'POST',
        path: '/movie',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(1).max(255),
                    description: Joi.string().required(),
                    releaseDate: Joi.date().required(),
                    director: Joi.string().required().max(255)
                })
            },
            handler: async (request, h) => {
                const { movieService } = request.services();
                const movie = await movieService.create(request.payload);
                return h.response(movie).code(201);
            }
        }
    },
    {
        method: 'PUT',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    title: Joi.string().min(1).max(255),
                    description: Joi.string(),
                    releaseDate: Joi.date(),
                    director: Joi.string().max(255)
                }).min(1)
            },
            handler: async (request, h) => {
                const { movieService } = request.services();
                const { id } = request.params;
                
                const movie = await movieService.findById(id);
                if (!movie) {
                    throw Boom.notFound('Movie not found');
                }

                return await movieService.update(id, request.payload);
            }
        }
    },
    {
        method: 'DELETE',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            },
            handler: async (request, h) => {
                const { movieService } = request.services();
                const { id } = request.params;
                
                const movie = await movieService.findById(id);
                if (!movie) {
                    throw Boom.notFound('Movie not found');
                }

                await movieService.delete(id);
                return h.response().code(204);
            }
        }
    },
    {
        method: 'GET',
        path: '/movie/favorites',
        options: {
            auth: {
                scope: ['user']
            },
            tags: ['api'],
            handler: async (request, h) => {
                try {
                    const { movieService } = request.services();
                    const { User } = request.models();
                    
                    // Get user from email in credentials
                    const email = request.auth.credentials.email;
                    const user = await User.query().findOne({ email });
                    
                    if (!user) {
                        console.error('User not found for email:', email);
                        throw Boom.unauthorized('User not found');
                    }

                    return await movieService.getFavorites(user.id);
                } catch (err) {
                    console.error('Error in get favorites route:', err);
                    throw err;
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/movie/{id}/favorite',
        options: {
            auth: {
                scope: ['user']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            },
            handler: async (request, h) => {
                try {
                    const { movieService } = request.services();
                    const { User } = request.models();
                    
                    // Get user from email in credentials
                    const email = request.auth.credentials.email;
                    const user = await User.query().findOne({ email });
                    
                    if (!user) {
                        console.error('User not found for email:', email);
                        throw Boom.unauthorized('User not found');
                    }
                    
                    const userId = user.id;
                    const { id: movieId } = request.params;
                    
                    const result = await movieService.addToFavorites(userId, movieId);
                    
                    return h.response(result).code(201);
                } catch (err) {
                    console.error('Error in favorite route:', err);
                    throw err;
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/movie/{id}/favorite',
        options: {
            auth: {
                scope: ['user']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            },
            handler: async (request, h) => {
                try {
                    const { movieService } = request.services();
                    const { User } = request.models();
                    
                    // Get user from email in credentials
                    const email = request.auth.credentials.email;
                    const user = await User.query().findOne({ email });
                    
                    if (!user) {
                        console.error('User not found for email:', email);
                        throw Boom.unauthorized('User not found');
                    }
                    
                    const userId = user.id;
                    const { id: movieId } = request.params;
                    
                    const result = await movieService.removeFromFavorites(userId, movieId);
                    
                    return h.response(result).code(204);
                } catch (err) {
                    console.error('Error in favorite route:', err);
                    throw err;
                }
            }
        }
    }
];
