const { Service } = require('@hapipal/schmervice');
const amqp = require('amqplib');

module.exports = class MessageBrokerService extends Service {
    async initialize() {
        try {
            console.log('Initializing MessageBrokerService...');
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            console.log('Connecting to RabbitMQ at:', rabbitmqUrl);
            
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            
            console.log('Connected to RabbitMQ, setting up queue');

            // Just assert the queue exists with the correct configuration
            await this.channel.assertQueue('csv_export', { 
                durable: true,
                arguments: {
                    'x-message-ttl': 3600000 // 1 hour TTL
                }
            });
            console.log('Queue setup complete');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async sendCSVExportMessage(data) {
        try {
            console.log('Sending CSV export message:', data);
            await this.channel.sendToQueue('csv_export', Buffer.from(JSON.stringify(data)));
            console.log('Message sent successfully');
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    async stop() {
        console.log('Stopping MessageBrokerService...');
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        console.log('MessageBrokerService stopped');
    }
}
