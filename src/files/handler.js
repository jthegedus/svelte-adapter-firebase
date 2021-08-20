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

	return {
		method: request.method,
		headers: toSvelteKitHeaders(request.headers),
		rawBody: new Uint8Array(request.rawBody),
		host,
		path: pathname,
		query: searchParameters
	};
}

/**
 * Convert Node.js http.IncomingHttpHeaders to SvelteKit Record<string,string>
 *
 * This is achieved by converting the all string[] header values to the expected type of a CSV string.
 *
 * Example:
 * 	input = { 'Content-Type': 'application/json', 'set-cookie': ['something', 'another'] }
 * 	output = { 'Content-Type': 'application/json', 'set-cookie': 'something,another' }
 *
 * @param {import('http').IncomingHttpHeaders} headers
 * @returns {Record<string, string>}
 */
function toSvelteKitHeaders(headers) {
	/** @type {Record<string, string>} */
	const finalHeaders = {};

	// Assume string | string[] types for all values
	for (const [key, value] of Object.entries(headers)) {
		finalHeaders[key] = Array.isArray(value) ?
			value.join(',') :
			value;
	}

	return finalHeaders;
}

export default svelteKit;
