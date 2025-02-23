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
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'Bienvenue sur notre application !',
            html: `
                <h1>Bienvenue ${user.firstName} !</h1>
                <p>Votre compte a été créé avec succès.</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email envoyé: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return info;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    }
};
