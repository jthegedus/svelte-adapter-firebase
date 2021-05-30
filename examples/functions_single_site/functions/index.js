const functions = require('firebase-functions');

let sveltekitServer;
exports.sveltekit = functions.https.onRequest(async (request, response) => {
	if (!sveltekitServer) {
		functions.logger.info('Initialising SvelteKit SSR Handler');
		sveltekitServer = require('./sveltekit/index').default;
		functions.logger.info('SvelteKit SSR Handler initialised!');
	}

	functions.logger.info('Requested resource: ' + request.originalUrl);
	return sveltekitServer(request, response);
});
