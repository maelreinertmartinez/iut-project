'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(movie) {
        const { Movie, User } = this.server.models();
        const { emailService } = this.server.services();

        // Create the movie
        const newMovie = await Movie.query().insertAndFetch(movie);

        try {
            // Get all users to notify about the new movie
            const users = await User.query();
            await emailService.sendNewMovieNotification(users, newMovie);
        } catch (err) {
            console.error('Failed to send new movie notification:', err);
        }

        return newMovie;
    }

    findAll() {
        const { Movie } = this.server.models();
        return Movie.query();
    }

    findById(id) {
        const { Movie } = this.server.models();
        return Movie.query().findById(id);
    }

    async update(id, movieData) {
        const { Movie, User } = this.server.models();
        const { emailService } = this.server.services();

        // Get the movie and its current state
        const movie = await Movie.query().findById(id);
        if (!movie) {
            throw Boom.notFound('Movie not found');
        }

        // Update the movie
        const updatedMovie = await Movie.query()
            .patchAndFetchById(id, movieData);

        try {
            // Get all users who have this movie in their favorites
            const users = await User.query()
                .joinRelated('favoriteMovies')
                .where('favoriteMovies.id', id)
                .distinct('user.*');

            if (users.length > 0) {
                // Calculate what changed
                const changes = {};
                Object.keys(movieData).forEach(key => {
                    if (movie[key] !== movieData[key]) {
                        changes[key] = movieData[key];
                    }
                });

                // Send notifications to users who have this movie in favorites
                await emailService.sendMovieUpdateNotification(users, updatedMovie, changes);
            }
        } catch (err) {
            console.error('Failed to send movie update notification:', err);
        }

        return updatedMovie;
    }

    delete(id) {
        const { Movie } = this.server.models();
        return Movie.query().deleteById(id);
    }

    async getFavorites(userId) {
        const { User } = this.server.models();
        
        try {
            const user = await User.query()
                .findById(userId)
                .withGraphFetched('favoriteMovies');

            if (!user) {
                throw Boom.notFound('User not found');
            }

            return user.favoriteMovies;
        } catch (err) {
            console.error('Error getting favorites:', err);
            throw err;
        }
    }

    async addToFavorites(userId, movieId) {
        const { Movie, UserFavorite } = this.server.models();

        try {
            const movie = await Movie.query().findById(movieId);
            
            if (!movie) {
                throw Boom.notFound('Movie not found');
            }

            const favorite = await UserFavorite.query().insert({
                userId: userId,
                movieId: movieId
            });
            
            return { success: true, favorite };
        }
        catch (err) {
            console.error('Error in addToFavorites:', err);
            if (err.code === '23505') {
                throw Boom.conflict('Movie is already in favorites');
            }
            throw Boom.internal('Failed to add movie to favorites: ' + err.message);
        }
    }

    async removeFromFavorites(userId, movieId) {
        const { UserFavorite } = this.server.models();
        
        try {
            const deleted = await UserFavorite.query()
                .delete()
                .where({ userId: userId, movieId: movieId });
            
            if (!deleted) {
                throw Boom.notFound('Movie is not in favorites');
            }

            return { success: true };
        } catch (err) {
            console.error('Error in removeFromFavorites:', err);
            throw Boom.internal('Failed to remove movie from favorites: ' + err.message);
        }
    }
};
