const functions = require('firebase-functions');

let svelte_function_single_siteServer;
exports.svelte_function_single_site = functions.https.onRequest(async (request, response) => {
	if (!svelte_function_single_siteServer) {
		functions.logger.info('Initializing SvelteKit SSR Handler');
		svelte_function_single_siteServer = require('./svelte_function_single_site/index').default;
		functions.logger.info('SvelteKit SSR Handler initialised!');
	}

	functions.logger.info('Requested resource: ' + request.originalUrl);
	return await svelte_function_single_siteServer(request, response);
});
