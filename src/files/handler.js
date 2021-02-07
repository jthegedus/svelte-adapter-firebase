const {get_body: getBody} = require('@sveltejs/app-utils/http');
const app = require('./app.cjs');

exports.sveltekitServer = async (request, response) => {
	const {pathname, query = ''} = new URL(
		request.url || '',
		`https://${request.headers.host}/`
	);

	const rendered = await app.render({
		host: null,
		method: request.method,
		headers: request.headers,
		path: pathname,
		query: new URLSearchParams(query),
		body: await getBody(request)
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return response.writeHead(status, headers).end(body);
	}

	return response.writeHead(404).end();
};
