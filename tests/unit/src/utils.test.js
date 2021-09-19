import {fileURLToPath} from 'url';
import path from 'path';
import {test} from 'uvu';
import * as assert from 'uvu/assert'; // eslint-disable-line node/file-extension-in-import
import {ensureCompatibleCloudFunctionVersion, ensureStaticResourceDirsDiffer, parseFirebaseConfiguration, validCloudFunctionName, validCloudRunServiceId} from '../../../src/utils.js';

// ParseFirebaseConfiguration: Valid configs
test(
	'Firebase config w Cloud Functions & single site',
	() => {
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Functions & multiple sites',
	() => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & single site',
	() => {
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & multiple sites',
	() => {
		const config = {target: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

// ParseFirebaseConfiguration: Invalid configs
test(
	'Firebase config does not exist',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('./does_not_exist.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config is invalid json',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/invalid.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config without "hosting" field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/missing_hosting.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w multiple sites missing "site" identifier',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/sites_missing_rewrites.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w multiple sites require a "target" to be specified',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_target.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w multiple sites but no match found for a "target" specified in svelte.config.js adapter config',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_target.json', import.meta.url));
		const config = {target: 'no_matching_site', sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w missing "public"',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_public.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test('Firebase config w empty "public" string', () => {
	const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_empty_public.json', import.meta.url));
	const config = {sourceRewriteMatch: '**', firebaseJsonPath};
	assert.throws(
		() => parseFirebaseConfiguration(config),
	);
});

test(
	'Firebase config w site missing "rewrites"',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_rewrite.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w "rewrites" mismatch',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_rewrite_mismatch.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: 'no_match', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w Cloud Run missing required "serviceId" field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_missing_serviceId.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w Cloud Run incompatible serviceId field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_serviceId.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w Cloud Run incompatible region field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_region.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w Cloud Function invalid name',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_invalid_function_name.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

test(
	'Firebase config w Cloud Functions & single site missing top-level functions',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_missing_functions.json', import.meta.url));
		const config = {target: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(
			() => parseFirebaseConfiguration(config),
		);
	},
);

// ValidCloudRunServiceId
test('Cloud Run serviceId with all valid char types', () => {
	const result = validCloudRunServiceId('is-valid1');
	assert.is(result, true);
});

test('Cloud Run serviceId with invalid dash prefix', () => {
	const result = validCloudRunServiceId('-not-valid1');
	assert.is(result, false);
});

test('Cloud Run serviceId with invalid dash suffix', () => {
	const result = validCloudRunServiceId('not-valid1-');
	assert.is(result, false);
});

test('Cloud Run serviceId with invalid uppercase char', () => {
	const result = validCloudRunServiceId('notValid1');
	assert.is(result, false);
});

test('Cloud Run serviceId with invalid non-dash ($) symbol', () => {
	const result = validCloudRunServiceId('not$valid1');
	assert.is(result, false);
});

test('Cloud Run serviceId with invalid non-dash (_) symbol', () => {
	const result = validCloudRunServiceId('not_valid1');
	assert.is(result, false);
});

test('Cloud Run serviceId with invalid length', () => {
	const result = validCloudRunServiceId('aCloudFunctionsFunctionNameThatIsSeventyFiveCharactersLongWhichIsMoreThan63');
	assert.is(result, false);
});

// ValidCloudFunctionName
test('Cloud Function name with valid chars', () => {
	const result = validCloudFunctionName('lowercase_UPPERCASE_0123456789');
	assert.is(result, true);
});

test('Cloud Function name with invalid dash', () => {
	const result = validCloudFunctionName('is-invalid');
	assert.is(result, false);
});

test('Cloud Function name with invalid length', () => {
	const result = validCloudFunctionName('aCloudFunctionsFunctionNameThatIsSeventyFiveCharactersLongWhichIsMoreThan63');
	assert.is(result, false);
});

// EnsureStaticResourceDirsDiffer
test('Static asset source and dest different dirs', () => {
	assert.not.throws(() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'b'}));
});

test(
	'Static asset source and dest the same dir',
	() => {
		assert.throws(
			() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'a'}),
		);
	},
);

// EnsureCompatibleCloudFunctionVersion
test('Valid Function runtime (nodejs14) version in package.json', () => {
	let version;
	assert.not.throws(() => {
		version = ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '14'});
	});
	assert.is(version, '14');
});
test('Valid Function runtime (nodejs14) version in firebase.json', () => {
	let version;
	assert.not.throws(() => {
		version = ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs14'});
	});
	assert.is(version, '14');
});
test('Valid Function runtime (nodejs16) version in package.json', () => {
	let version;
	assert.not.throws(() => {
		version = ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '16'});
	});
	assert.is(version, '16');
});
test('Valid Function runtime (nodejs16) version in firebase.json', () => {
	let version;
	assert.not.throws(() => {
		version = ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs16'});
	});
	assert.is(version, '16');
});

test(
	'No Function runtime provided',
	() => {
		assert.throws(
			() => ensureCompatibleCloudFunctionVersion({}),
			error => error.message === 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16',
		);
	},
);
test(
	'Invalid Function runtime in package.json',
	() => {
		assert.throws(
			() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '12'}),
			error => error.message === 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16',
		);
	},
);
test(
	'Invalid Function runtime in firebase.json',
	() => {
		assert.throws(
			() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs12'}),
			error => error.message === 'Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of nodejs14,nodejs16 or "functions/package.json:engines.node" with one of 14,16',
		);
	},
);

test.run();
