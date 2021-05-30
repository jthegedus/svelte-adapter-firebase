import {URL} from 'url';
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
		rawBody: getRawBody(request)
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return response.writeHead(status, headers).end(body);
	}

	return response.writeHead(404).end();
};

const getRawBody = request => {
	if (!request.headers['content-type']) {
		return request.rawBody;
	}

	const [type] = request.headers['content-type'].split(/;\s*/);

	if (type === 'application/octet-stream') {
		return request.body;
	}

	const encoding = request.headers['content-encoding'] || 'utf-8';

	return new TextDecoder(encoding).decode(request.rawBody);
};

export default svelteKit;
