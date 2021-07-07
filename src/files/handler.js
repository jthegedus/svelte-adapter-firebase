// TODO: hardcoding the relative location makes this brittle
import {init, render} from '../output/server/app.js';

init();

/**
 * Firebase Cloud Function handler for SvelteKit
 *
 * This function converts the Firebase Cloud Function (Express.js) Request object
 * into a format consumable to the SvelteKit render() function, which is of type
 * SvelteKit `import('types/hooks').StrictBody | null`
 *
 * Relevant documentation - https://firebase.google.com/docs/functions/http-events#read_values_from_the_request
 *
 * @param {import('firebase-functions').https.Request} request
 * @param {import('express').Response} response
 * @returns {Promise<void>}
 */
const svelteKit = async ({body, headers, method, rawBody, url}, response) => {
	const host = `${headers['x-forwarded-proto']}://${headers.host}`;
	const {pathname, searchParams: searchParameters = ''} = new URL(url || '', host);

	const finalRawBody =
		headers['content-type'] === undefined ?
			rawBody :
			(headers['content-type'] === 'application/octet-stream' ?
				body :
				new TextDecoder(headers['content-encoding'] || 'utf-8').decode(rawBody));

	const rendered = await render({
		method,
		headers,
		path: pathname,
		query: searchParameters,
		rawBody: finalRawBody
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return response.writeHead(status, headers).end(body);
	}

	return response.writeHead(404).end();
};

export default svelteKit;
