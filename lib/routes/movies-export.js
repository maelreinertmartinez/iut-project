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
                const movies = await movieService.findAll();
                
                const message = {
                    movies,
                    userEmail: request.auth.credentials.email
                };

                await messageBrokerService.sendCSVExportMessage(message);

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
