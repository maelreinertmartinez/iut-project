const amqp = require('amqplib');
const { Parser } = require('json2csv');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function startWorker() {
    try {
        console.log('Starting worker...');
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        console.log('Connecting to RabbitMQ at:', rabbitmqUrl);
        
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        const queue = 'csv_export';

        console.log('Connected to RabbitMQ, setting up queue:', queue);

        // Don't delete the queue, just assert it exists with the same configuration
        await channel.assertQueue(queue, { 
            durable: true,
            arguments: {
                'x-message-ttl': 3600000 // 1 hour TTL
            }
        });
        
        console.log('CSV Export worker is running and waiting for messages...');

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Verify SMTP connection
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (error) {
            console.error('SMTP verification failed:', error);
            throw error;
        }

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                console.log('Received message:', msg.content.toString());
                const data = JSON.parse(msg.content.toString());
                const { movies, userEmail } = data;

                console.log(`Processing export request for ${userEmail} with ${movies.length} movies`);

                try {
                    // Convert movies to CSV
                    const parser = new Parser();
                    const csv = parser.parse(movies);
                    console.log('CSV generated successfully');

                    // Send email with CSV attachment
                    const info = await transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: userEmail,
                        subject: 'Movies CSV Export',
                        text: 'Please find attached the CSV export of all movies.',
                        attachments: [{
                            filename: 'movies.csv',
                            content: csv
                        }]
                    });

                    // Log Ethereal URL to preview the email
                    console.log('Email sent successfully');
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                    channel.ack(msg);
                    console.log(`CSV sent to ${userEmail}`);
                } catch (error) {
                    console.error('Error processing message:', error);
                    channel.nack(msg);
                }
            }
        });

        // Handle connection errors
        connection.on('error', (error) => {
            console.error('RabbitMQ connection error:', error);
        });

        channel.on('error', (error) => {
            console.error('RabbitMQ channel error:', error);
        });

    } catch (error) {
        console.error('Worker error:', error);
        // Wait 5 seconds and try to reconnect
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            startWorker();
        }, 5000);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Worker shutting down...');
    process.exit();
});

console.log('Starting CSV export worker...');
startWorker();
