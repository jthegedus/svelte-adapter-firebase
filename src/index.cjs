exports.svelteKit = async (request, response) => {
	const {default: app} = await import('./handler.mjs');
	await app(request, response);
};
