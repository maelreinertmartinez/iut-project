'use strict';

const HauteCouture = require('@hapipal/haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {
        // Custom plugin code can go here
        await HauteCouture.compose(server, options);

        // Initialize message broker service
        const { messageBrokerService } = server.services();
        await messageBrokerService.initialize();

        // Cleanup on server stop
        server.events.on('stop', async () => {
            const { messageBrokerService } = server.services();
            await messageBrokerService.stop();
        });
    }
};
