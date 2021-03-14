import test from 'ava';
import {parseFirebaseConfiguration} from '../src/utils.js';

// Valid configs
test.serial(
	'firebase config w Cloud Functions & single site',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/successes/cf_site.json'};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: 'functions'}, cloudrun: false, publicDir: 'app'};

		t.deepEqual(result, expectedResult);
	}
);

test.serial(
	'firebase config w Cloud Functions & multiple sites',
	t => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/successes/cf_sites.json'};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: 'functions'}, cloudrun: false, publicDir: 'app'};

		t.deepEqual(result, expectedResult);
	}
);

test.serial(
	'firebase config w Cloud Run & single site',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/successes/cr_site.json'};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudrun: {serviceId: 'some_service', region: 'us-central1'}, publicDir: 'app'};

		t.deepEqual(result, expectedResult);
	}
);

test.serial(
	'firebase config w Cloud Run & multiple sites',
	t => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/successes/cr_sites.json'};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudrun: {serviceId: 'some_service', region: 'us-central1'}, publicDir: 'app'};

		t.deepEqual(result, expectedResult);
	}
);

// Invalid configs
test.serial(
	'firebase config does not exist',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './does_not_exist.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'File ./does_not_exist.json does not exist. The provided file should exist and be a Firebase JSON config.');
	}
);

test.serial(
	'firebase config is invalid json',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/failures/invalid.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'Error parsing ./tests/fixtures/failures/invalid.json. Unexpected token } in JSON at position 28');
	}
);

test.serial(
	'firebase config w Cloud Functions & single site missing top-level functions',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/failures/cf_site_missing_functions.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'Error with config ./tests/fixtures/failures/cf_site_missing_functions.json. If you\'re using Cloud Functions for your SSR rewrite rule, you need to define a "functions.source" field (of type string) at your config root.');
	}
);

test.serial(
	'firebase config missing rewrites',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/failures/site_missing_rewrite.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'Error with config ./tests/fixtures/failures/site_missing_rewrite.json. "hosting[].rewrites" field  required in hosting config and should be an array of object(s). Hosting config with error: {"public":"app"}');
	}
);

test.serial(
	'firebase config rewrite mismatch',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: 'no_match', firebaseJson: './tests/fixtures/failures/cf_site_rewrite_mismatch.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'Error with config ./tests/fixtures/failures/cf_site_rewrite_mismatch.json. "hosting[].rewrites[*]" does not contain a config with "source":"no_match" and either "function" or "run". Is your sourceRewriteMatch in svelte\'config.js correct?');
	}
);

test.serial(
	'firebase config multiple sites require a hostingSite to be specified',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: './tests/fixtures/failures/cf_multi_site_requires_hostingSite.json'};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'Error with config ./tests/fixtures/failures/cf_multi_site_requires_hostingSite.json. No "hosting[].site" match for undefined. Ensure your svelte.config.js adapter config "hostingSite" matches an item in your Firebase config.');
	}
);

// TODO: more tests