import {fileURLToPath} from 'url';
import path from 'path';
import test from 'ava';
import {ensureCompatibleCloudFunctionVersion, ensureStaticResourceDirsDiffer, parseFirebaseConfiguration, validCloudFunctionName, validCloudRunServiceId} from '../../../src/utils.js';

// ParseFirebaseConfiguration: Valid configs
test(
	'Firebase config w Cloud Functions & single site',
	t => {
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Functions & multiple sites using "firebase.json:hosting[].site" field',
	t => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_sites_w_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Functions & multiple sites using "firebase.json:hosting[].target" field',
	t => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_sites_w_target.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & single site',
	t => {
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & multiple sites using "firebase.json:hosting[].site" field',
	t => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_sites_w_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & multiple sites using "firebase.json:hosting[].target" field',
	t => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_sites_w_target.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		t.deepEqual(result, expectedResult);
	},
);

// ParseFirebaseConfiguration: Invalid configs
test(
	'Firebase config does not exist',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('./does_not_exist.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: `Error: The adapter requires a "firebase.json" file. "firebaseJsonPath:${fileURLToPath(new URL('../src/does_not_exist.json', import.meta.url))}" does not exist.`});
	},
);

test(
	'Firebase config is invalid json',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/invalid.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: `Error: failure while parsing ${fileURLToPath(new URL('../fixtures/failures/invalid.json', import.meta.url))}. Unexpected token } in JSON at position 28`});
	},
);

test(
	'Firebase config without "hosting" field',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/missing_hosting.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: "hosting" config missing from "firebase.json"'});
	},
);

test(
	'Firebase config w multiple sites missing "site" or "target" identifier',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/sites_missing_rewrites.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Multiple "hosting" configurations found, each requires either a "site" field or "target" field, one does not. https://firebase.google.com/docs/hosting/multisites'});
	},
);

test(
	'Firebase config w multiple sites requires a "svelte.config.js:target" field to be specified',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_target.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Multiple "hosting" configurations found, but no "target" specified in "svelte.config.js" adapter config. Provide one so we can match the config correctly.'});
	},
);

test(
	'Firebase config w multiple sites but no match found for a "target" specified in svelte.config.js adapter config',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_target.json', import.meta.url));
		const config = {target: 'no_matching_site', sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Multiple "hosting" configurations found in "firebase.json" but not match found for no_matching_site specified in "svelte.config.js" adapter config. "hosting[].site" & "hosting[].target" values [{"target":"app"},{"site":"blog"},{"site":"marketing"}]'});
	},
);

test(
	'Firebase config w missing "public"',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_public.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Required "hosting.public" field not found for hosting configuration.'});
	},
);

test('Firebase config w empty "public" string', t => {
	const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_empty_public.json', import.meta.url));
	const config = {sourceRewriteMatch: '**', firebaseJsonPath};
	t.throws(
		() => parseFirebaseConfiguration(config),
		{message: 'Error: Required "hosting.public" field is an empty string, a directory is required.'});
});

test(
	'Firebase config w site missing "rewrites"',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_rewrite.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Required "hosting[].rewrites" field not found for matched hosting configuration. Specify your Cloud Function with rewrite rule matching "source":"**"'});
	},
);

test(
	'Firebase config w "rewrites" mismatch',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_rewrite_mismatch.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: 'no_match', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Required "hosting[].rewrites[]" does not contain a config with "source":"no_match" and either "function":"<func_name>" or "run":{...} entries'});
	},
);

test(
	'Firebase config w Cloud Run missing required "serviceId" field',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_missing_serviceId.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Required "serviceId" field not found for Cloud Run rewrite rule in "firebase.json"'});
	},
);

test(
	'Firebase config w Cloud Run incompatible serviceId field',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_serviceId.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Cloud Run "serviceId" must use only lowercase alphanumeric characters and dashes cannot begin or end with a dash, and cannot be longer than 63 characters.'});
	},
);

test(
	'Firebase config w Cloud Run incompatible region field',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_region.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Cloud Run "region" is invalid, it should be "use-west1".'});
	},
);

test(
	'Firebase config w Cloud Function invalid name',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_invalid_function_name.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Cloud Function name must use only alphanumeric characters and underscores and cannot be longer than 63 characters'});
	},
);

test(
	'Firebase config w Cloud Functions & single site missing top-level functions',
	t => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_missing_functions.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		t.throws(
			() => parseFirebaseConfiguration(config),
			{message: 'Error: Required "functions.source" field is missing from Firebase Configuration file.'});
	},
);

// ValidCloudRunServiceId
test('Cloud Run serviceId with all valid char types', t => {
	const result = validCloudRunServiceId('is-valid1');
	t.is(result, true);
});

test('Cloud Run serviceId with invalid dash prefix', t => {
	const result = validCloudRunServiceId('-not-valid1');
	t.is(result, false);
});

test('Cloud Run serviceId with invalid dash suffix', t => {
	const result = validCloudRunServiceId('not-valid1-');
	t.is(result, false);
});

test('Cloud Run serviceId with invalid uppercase char', t => {
	const result = validCloudRunServiceId('notValid1');
	t.is(result, false);
});

test('Cloud Run serviceId with invalid non-dash ($) symbol', t => {
	const result = validCloudRunServiceId('not$valid1');
	t.is(result, false);
});

test('Cloud Run serviceId with invalid non-dash (_) symbol', t => {
	const result = validCloudRunServiceId('not_valid1');
	t.is(result, false);
});

test('Cloud Run serviceId with invalid length', t => {
	const result = validCloudRunServiceId('aCloudFunctionsFunctionNameThatIsSeventyFiveCharactersLongWhichIsMoreThan63');
	t.is(result, false);
});

// ValidCloudFunctionName
test('Cloud Function name with valid chars', t => {
	const result = validCloudFunctionName('lowercase_UPPERCASE_0123456789');
	t.is(result, true);
});

test('Cloud Function name with invalid dash', t => {
	const result = validCloudFunctionName('is-invalid');
	t.is(result, false);
});

test('Cloud Function name with invalid length', t => {
	const result = validCloudFunctionName('aCloudFunctionsFunctionNameThatIsSeventyFiveCharactersLongWhichIsMoreThan63');
	t.is(result, false);
});

// EnsureStaticResourceDirsDiffer
test('Static asset source and dest different dirs', t => {
	t.notThrows(
		() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'b'}),
		'Error: Required "functions.source" field is missing from Firebase Configuration file.',
	);
});

test(
	'Static asset source and dest the same dir',
	t => {
		t.throws(
			() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'a'}),
			{message: 'Error: "firebase.json:hosting.public" field (a) must be a different directory to "svelte.config.js:kit.files.assets" field (a).'},
		);
	},
);

// EnsureCompatibleCloudFunctionVersion
test('Valid Function runtime (nodejs14) version in package.json', t => {
	let version;
	t.notThrows(
		() => {
			version = ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '14'});
		},
		'',
	);
	t.is(version, '14');
});
test('Valid Function runtime (nodejs14) version in firebase.json', t => {
	let version;
	t.notThrows(
		() => {
			version = ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs14'});
		},
		'',
	);
	t.is(version, '14');
});
test('Valid Function runtime (nodejs16) version in package.json', t => {
	let version;
	t.notThrows(
		() => {
			version = ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '16'});
		},
		'',
	);
	t.is(version, '16');
});
test('Valid Function runtime (nodejs16) version in firebase.json', t => {
	let version;
	t.notThrows(
		() => {
			version = ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs16'});
		},
		'',
	);
	t.is(version, '16');
});

test(
	'No Function runtime provided',
	t => {
		t.throws(
			() => ensureCompatibleCloudFunctionVersion({}),
			{message: 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16'},
		);
	},
);
test(
	'Invalid Function runtime in package.json',
	t => {
		t.throws(
			() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '12'}),
			{message: 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16'},
		);
	},
);
test(
	'Invalid Function runtime in firebase.json',
	t => {
		t.throws(
			() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs12'}),
			{message: 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16'},
		);
	},
);
