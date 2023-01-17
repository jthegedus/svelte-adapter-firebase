import process from 'process';
import {Server} from 'SERVER';
import {manifest} from 'MANIFEST';
import {toSvelteKitRequest} from './firebase-to-svelte-kit.js';

const server = new Server(manifest);

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
export default async function svelteKit(request, response) {
	await server.init({
		env: process.env,
	});

	const rendered = await server.respond(toSvelteKitRequest(request), {
		getClientAddress() {
			return request.headers.get('x-forwarded-for');
		},
	});
	const body = await rendered.text();

	return rendered
		? response.writeHead(rendered.status, Object.fromEntries(rendered.headers)).end(body)
		: response.writeHead(404, 'Not Found').end();
}
