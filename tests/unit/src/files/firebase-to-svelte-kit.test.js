import test from 'ava';

import {toSvelteKitHeaders} from '../../../../src/files/firebase-to-svelte-kit.js';

// Headers
test('leave headers without string[] untouched', t => {
	const input = {
		accept: 'something',
		'accept-language': 'en',
	};
	const expected = input;
	const result = toSvelteKitHeaders(input);

	t.deepEqual(result, expected);
});

test('convert string[] headers to csv string values', t => {
	const expected = {
		accept: 'something',
		'accept-language': 'en',
		'set-cookie': 'some,cookie,data',
	};
	const result = toSvelteKitHeaders({
		accept: 'something',
		'accept-language': 'en',
		'set-cookie': ['some', 'cookie', 'data'],
	});

	t.deepEqual(result, expected);
});

test('convert string[] headers of any kind to csv string values', t => {
	const expected = {
		accept: 'something',
		'accept-language': 'en',
		'user-defined-header': 'some,user,defined,header,data',
	};
	const result = toSvelteKitHeaders({
		accept: 'something',
		'accept-language': 'en',
		'user-defined-header': ['some', 'user', 'defined', 'header', 'data'],
	});

	t.deepEqual(result, expected);
});
