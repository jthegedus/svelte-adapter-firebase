import {api} from './_api.js';

// GET /todos.json
export const get = async request => {
	// Request.locals.userid comes from src/hooks.js
	const response = await api(request, `todos/${request.locals.userid}`);

	if (response.status === 404) {
		// User hasn't created a todo list.
		// start with an empty array
		return {body: []};
	}

	return response;
};

// POST /todos.json
export const post = async request => {
	const response = await api(request, `todos/${request.locals.userid}`, {
		// Because index.svelte posts a FormData object,
		// request.body is _also_ a (readonly) FormData
		// object, which allows us to get form data
		// with the `body.get(key)` method
		text: request.body.get('text')
	});

	return response;
};
