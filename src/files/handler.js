import {URL} from 'url';
import {getRawBody} from '@sveltejs/kit/node';
import '@sveltejs/kit/install-fetch'; // eslint-disable-line import/no-unassigned-import

// TODO: hardcoding the relative location makes this brittle
import {render} from '../output/server/app.js';

const svelteKit = async (request, response) => {
	const host = `${request.headers['x-forwarded-proto']}://${request.headers.host}`;
	const {pathname, searchParams: searchParameters = ''} = new URL(request.url || '', host);

	const rendered = await render({
		method: request.method,
		headers: request.headers,
		path: pathname,
		query: searchParameters,
		body: await getRawBody(request)
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return response.writeHead(status, headers).end(body);
	}

	return response.writeHead(404).end();
};

export default svelteKit;
