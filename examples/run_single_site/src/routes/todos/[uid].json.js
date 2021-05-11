import {api} from './_api.js';

// PATCH /todos/:uid.json
export const patch = async request => {
	return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
		text: request.body.get('text'),
		done: request.body.has('done') ? Boolean(request.body.get('done')) : undefined
	});
};

// DELETE /todos/:uid.json
export const del = async request => {
	return api(request, `todos/${request.locals.userid}/${request.params.uid}`);
};
