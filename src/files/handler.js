// TODO: hardcoding the relative location makes this brittle
// @ts-expect-error
import {init, render} from '../output/server/app.js';
import {toSvelteKitRequest} from './firebase-to-svelte-kit.js';

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

export default svelteKit;
