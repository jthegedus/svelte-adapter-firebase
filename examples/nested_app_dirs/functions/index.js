const functions = require('firebase-functions');

let nested_app_dirServer;
exports.nested_app_dir = functions.https.onRequest(async (request, response) => {
	if (!nested_app_dirServer) {
		functions.logger.info('Initializing SvelteKit SSR Handler');
		nested_app_dirServer = require('./nested_app_dir/index').default;
		functions.logger.info('SvelteKit SSR Handler initialised!');
	}

	functions.logger.info('Requested resource: ' + request.originalUrl);
	return nested_app_dirServer(request, response);
});
