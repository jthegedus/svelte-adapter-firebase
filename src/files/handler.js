import {URL} from 'url';
import {get_body as getBody} from '@sveltejs/app-utils/http'; // eslint-disable-line node/file-extension-in-import

const svelteKit = async (request, response) => {
	const host = `${request.headers['x-forwarded-proto']}://${request.headers.host}`;
	const {pathname, searchParams} = new URL(request.url || '', host);

	const {render} = await import('./app.mjs');

	const rendered = await render({
		host: null,
		method: request.method,
		headers: request.headers,
		path: pathname,
		query: searchParams,
		body: await getBody(request)
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return response.writeHead(status, headers).end(body);
	}

	return response.writeHead(404).end();
};

export default svelteKit;
