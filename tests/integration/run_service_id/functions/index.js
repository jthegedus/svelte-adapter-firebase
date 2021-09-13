const functions = require('firebase-functions');

let cloudrunServer;
exports.sveltekit = functions.https.onRequest(async (request, response) => {
	if (!cloudrunServer) {
		functions.logger.info('Initialising SvelteKit SSR Handler');
		cloudrunServer = require('./svelte-run-serviceid/index').default;
		functions.logger.info('SvelteKit SSR Handler initialised!');
	}

	functions.logger.info('Requested resource: ' + request.originalUrl);
	return cloudrunServer(request, response);
});
