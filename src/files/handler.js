const {parse, URLSearchParams} = require("url");
const {get_body: getBody} = require("@sveltejs/app-utils/http");
const app = require("./app.js");

exports.sveltekit_server = async (req, res) => {
	const {pathname, query = ""} = parse(req.url || "");

	const rendered = await app.render({
		host: null,
		// TODO
		method: req.method,
		headers: req.headers,
		path: pathname,
		query: new URLSearchParams(query),
		body: await getBody(req),
	});

	if (rendered) {
		const {status, headers, body} = rendered;
		return res.writeHead(status, headers).end(body);
	}

	return res.writeHead(404).end();
};
