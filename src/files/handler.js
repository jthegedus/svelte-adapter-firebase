// TODO: hardcoding the relative location makes this brittle
// @ts-expect-error
import {init, render} from '../output/server/app.js';

init();

/**
 * Firebase Cloud Function handler for SvelteKit
 *
 * This function converts the Firebase Cloud Function (Express.js) Request object
 * into a format consumable to the SvelteKit render() function
 *
 * Relevant documentation - https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
 *
 * @param {import('firebase-functions').https.Request} request
 * @param {import('express').Response} response
 * @returns {Promise<void>}
 */
async function svelteKit(request, response) {
	const rendered = await render(toSvelteKitRequest(request));

	return rendered ?
		response.writeHead(rendered.status, rendered.headers).end(rendered.body) :
		response.writeHead(404, 'Not Found').end();
}

/**
 * @param {import('firebase-functions').https.Request} request
 * @return {import('@sveltejs/kit/types/internal').Incoming}
 */
function toSvelteKitRequest(request) {
	const host = `${request.headers['x-forwarded-proto']}://${request.headers.host}`;
	const {pathname, searchParams: searchParameters} = new URL(request.url || '', host);

	// Copy all values from request.headers except 'set-cookie' as it is the unsupported string[] type
	// If 'set-cookie' was in initial request headers, convert it to a csv string value.
	const {'set-cookie': setCookie, ...rest} = request.headers;
	const finalHeaders = /** @type {Record<string, string>} */ ({...rest});
	if (request.headers['set-cookie']) {
		finalHeaders['set-cookie'] = request.headers['set-cookie'].join(',');
	}

	return {
		method: request.method,
		headers: finalHeaders,
		rawBody: new Uint8Array(request.rawBody),
		host,
		path: pathname,
		query: searchParameters
	};
}

export default svelteKit;
