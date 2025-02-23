'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    create(movie) {
        const { Movie } = this.server.models();
        return Movie.query().insertAndFetch(movie);
    }

    findAll() {
        const { Movie } = this.server.models();
        return Movie.query();
    }

    findById(id) {
        const { Movie } = this.server.models();
        return Movie.query().findById(id);
    }

    update(id, movie) {
        const { Movie } = this.server.models();
        return Movie.query().findById(id).patch(movie);
    }

    delete(id) {
        const { Movie } = this.server.models();
        return Movie.query().deleteById(id);
    }

    async getFavorites(userId) {
        const { User } = this.server.models();
        console.log('Getting favorites for user:', userId);
        
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
        console.log('Adding to favorites:', { userId, movieId });

        try {
            const movie = await Movie.query().findById(movieId);
            console.log('Found movie:', movie);
            
            if (!movie) {
                throw Boom.notFound('Movie not found');
            }

            const favorite = await UserFavorite.query().insert({
                userId: userId,
                movieId: movieId
            });
            console.log('Created favorite:', favorite);
            
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
        console.log('Removing from favorites:', { userId, movieId });
        
        try {
            const deleted = await UserFavorite.query()
                .delete()
                .where({ userId: userId, movieId: movieId });
            
            console.log('Delete result:', deleted);
            
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
