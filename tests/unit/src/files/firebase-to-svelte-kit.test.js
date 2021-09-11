import Buffer from 'buffer';
import {test} from 'uvu';
import * as assert from 'uvu/assert'; // eslint-disable-line node/file-extension-in-import

import {toSvelteKitRequest, toSvelteKitHeaders} from '../../../../src/files/firebase-to-svelte-kit.js';

// Headers
test('leave headers without string[] untouched', () => {
	const input = {
		accept: 'something',
		'accept-language': 'en',
	};
	const expected = input;
	const result = toSvelteKitHeaders(input);

	assert.equal(result, expected, 'match');
});

test('convert string[] headers to csv string values', () => {
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

	assert.equal(result, expected, 'string[] has been converted to csv string');
});

test('convert string[] headers of any kind to csv string values', () => {
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

	assert.equal(result, expected, 'string[] has been converted to csv string');
});

// Request
test('firebase-functions.https.request GET is converted to SvelteKit Incoming request type correctly', () => {
	const firebaseRequest = {
		method: 'GET',
		headers: {
			'accept-language': 'en',
			'set-cookie': ['some', 'cookie', 'data'],
			host: 'us-central1-func.cloudfunctions.net',
			'x-forwarded-proto': 'https',
		},
		url: '/url?some=thing',
	};

	const expectedKitRequest = {
		method: 'GET',
		headers: {
			'accept-language': 'en',
			'set-cookie': 'some,cookie,data',
			host: 'us-central1-func.cloudfunctions.net',
			'x-forwarded-proto': 'https',
		},
		rawBody: new Uint8Array(),
		host: 'https://us-central1-func.cloudfunctions.net',
		path: '/url',
		query: new URL('/url?some=thing', 'https://us-central1-func.cloudfunctions.net').searchParams,
	};

	const result = toSvelteKitRequest(firebaseRequest);

	assert.equal(result, expectedKitRequest, 'match');
});

test('firebase-functions.https.request POST is converted to SvelteKit Incoming request type correctly', () => {
	const firebaseRequest = {
		method: 'POST',
		headers: {
			'accept-language': 'en',
			'set-cookie': ['some', 'cookie', 'data'],
			host: 'us-central1-func.cloudfunctions.net',
			'x-forwarded-proto': 'https',
		},
		rawBody: Buffer.from('some-data', 'utf8'),
		url: '/url?some=thing',
	};

	const expectedKitRequest = {
		method: 'POST',
		headers: {
			'accept-language': 'en',
			'set-cookie': 'some,cookie,data',
			host: 'us-central1-func.cloudfunctions.net',
			'x-forwarded-proto': 'https',
		},
		rawBody: Buffer.from('some-data', 'utf-8'),
		host: 'https://us-central1-func.cloudfunctions.net',
		path: '/url',
		query: new URL('/url?some=thing', 'https://us-central1-func.cloudfunctions.net').searchParams,
	};

	const result = toSvelteKitRequest(firebaseRequest);

	assert.equal(result, expectedKitRequest, 'match');
});

test.run();
