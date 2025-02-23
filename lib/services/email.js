'use strict';

const nodemailer = require('nodemailer');
const { Service } = require('@hapipal/schmervice');
require('dotenv').config();

module.exports = class EmailService extends Service {

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendWelcomeEmail(user) {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: 'Welcome to Movie Library!',
            text: `Hello ${user.firstName},\n\nWelcome to Movie Library! We're excited to have you join us.\n\nBest regards,\nMovie Library Team`
        });
    }

    async sendNewMovieNotification(users, movie) {
        const emails = users.map(user => user.email);
        
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: emails.join(', '),
            subject: 'New Movie Added: ' + movie.title,
            text: `Hello,\n\nA new movie has been added to our library!\n\n` +
                  `Title: ${movie.title}\n` +
                  `Director: ${movie.director}\n` +
                  `Release Date: ${new Date(movie.releaseDate).toLocaleDateString()}\n` +
                  `Description: ${movie.description}\n\n`
        });
    }

    async sendMovieUpdateNotification(users, movie, changes) {
        const emails = users.map(user => user.email);
        const changedFields = Object.keys(changes)
            .map(field => `${field}: ${changes[field]}`)
            .join('\n');
        
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: emails.join(', '),
            subject: 'Movie Updated: ' + movie.title,
            text: `Hello,\n\nA movie in your favorites has been updated!\n\n` +
                  `Title: ${movie.title}\n\n` +
                  `Changes made:\n${changedFields}\n\n`
        });
    }
};
