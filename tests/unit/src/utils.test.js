import {fileURLToPath} from 'url';
import path from 'path';
import {test} from 'uvu';
import * as assert from 'uvu/assert'; // eslint-disable-line node/file-extension-in-import
import {ensureCompatibleCloudFunctionVersion, ensureStaticResourceDirsDiffer, parseFirebaseConfiguration, validCloudFunctionName, validCloudRunServiceId} from '../../../src/utils.js';

// ParseFirebaseConfiguration: Valid configs
test(
	'Firebase config w Cloud Functions & single site',
	() => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Functions & multiple sites',
	() => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cf_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & single site',
	() => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some-service', source: path.join(path.dirname(config.firebaseJsonPath), 'functions'), runtime: undefined}, publicDir: path.join(path.dirname(config.firebaseJsonPath), 'app')};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & multiple sites',
	() => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJsonPath: fileURLToPath(new URL('../fixtures/successes/cr_sites.json', import.meta.url))};
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
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config is invalid json',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/invalid.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config without "hosting" field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/missing_hosting.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w multiple sites missing "site" identifier',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/sites_missing_rewrites.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w multiple sites require a "hostingSite" to be specified',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w multiple sites but no match found for a "hostingSite" specified in svelte.config.js adapter config',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: 'no_matching_site', sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w missing "public"',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_public.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test('Firebase config w empty "public" string', () => {
	const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_empty_public.json', import.meta.url));
	const config = {sourceRewriteMatch: '**', firebaseJsonPath};
	assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
});

test(
	'Firebase config w site missing "rewrites"',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/site_missing_rewrite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w "rewrites" mismatch',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_rewrite_mismatch.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: 'no_match', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w Cloud Run missing required "serviceId" field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_missing_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w Cloud Run incompatible serviceId field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w Cloud Run incompatible region field',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cr_invalid_region.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w Cloud Function invalid name',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_invalid_function_name.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
	},
);

test(
	'Firebase config w Cloud Functions & single site missing top-level functions',
	() => {
		const firebaseJsonPath = fileURLToPath(new URL('../fixtures/failures/cf_site_missing_functions.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJsonPath};
		assert.throws(() => parseFirebaseConfiguration(config), /TODO/);
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
		assert.throws(() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'a'}), /TODO/);
	},
);

// EnsureCompatibleCloudFunctionVersion
test('Valid Function runtime (nodejs14) version in package.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '14'}));
	// TODO(jthegedus): assert returned version
});
test('Valid Function runtime (nodejs14) version in firebase.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs14'}));
	// TODO(jthegedus): assert returned version
});
test('Valid Function runtime (nodejs16) version in package.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '16'}));
	// TODO(jthegedus): assert returned version
});
test('Valid Function runtime (nodejs16) version in firebase.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs16'}));
	// TODO(jthegedus): assert returned version
});

test(
	'No Function runtime provided',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({}), /TODO/);
	},
);
test(
	'Invalid Function runtime in package.json',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '12'}), /TODO/);
	},
);
test(
	'Invalid Function runtime in firebase.json',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs12'}), /TODO/);
	},
);

test.run();
