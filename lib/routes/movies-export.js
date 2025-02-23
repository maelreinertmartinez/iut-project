module.exports = {
    method: 'GET',
    path: '/movies/export',
    options: {
        auth: {
            scope: ['admin']
        },
        handler: async (request, h) => {
            console.log('Export request received from:', request.auth.credentials);
            const { messageBrokerService, movieService } = request.services();
            
            try {
                console.log('Fetching all movies...');
                const movies = await movieService.findAll();
                console.log(`Found ${movies.length} movies`);
                
                const message = {
                    movies,
                    userEmail: request.auth.credentials.email
                };
                console.log('Sending message to broker:', message);

                await messageBrokerService.sendCSVExportMessage(message);
                console.log('Message sent to broker successfully');

                return h.response({
                    message: 'CSV export has been initiated. You will receive the file by email shortly.'
                }).code(202);
            } catch (error) {
                console.error('Export error:', error);
                return h.response({
                    error: 'Failed to initiate CSV export'
                }).code(500);
            }
        }
    }
};
