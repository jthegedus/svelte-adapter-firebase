/**
 * Convert Firebase Cloud Function Request to SvelteKit Request
 *
 * @param {import('firebase-functions').https.Request} request
 * @return {import('@sveltejs/kit').IncomingRequest}
 */
export function toSvelteKitRequest(request) {
	// Firebase sometimes omits the protocol used. Default to http.
	const protocol = request.headers['x-forwarded-proto'] || 'http';
	// Firebase forwards the request to sveltekit, use the forwarded host.
	const host = `${protocol}://${request.headers['x-forwarded-host']}`;
	const {href, pathname, searchParams: searchParameters} = new URL(request.url || '', host);
	// eslint-disable-next-line no-undef
	return new Request(href, {
		method: request.method,
		headers: toSvelteKitHeaders(request.headers),
		body: request.rawBody ?? null,
		host,
		path: pathname,
		query: searchParameters,
	});
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
export function toSvelteKitHeaders(headers) {
	/** @type {Record<string, string>} */
	const finalHeaders = {};

	// Assume string | string[] types for all values
	for (const [key, value] of Object.entries(headers)) {
		finalHeaders[key] = Array.isArray(value)
			? value.join(',')
			: value;
	}

	return finalHeaders;
}
