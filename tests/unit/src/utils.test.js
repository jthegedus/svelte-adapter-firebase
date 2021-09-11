import {fileURLToPath} from 'url';
import path from 'path';
import {test} from 'uvu';
import * as assert from 'uvu/assert'; // eslint-disable-line node/file-extension-in-import
import {ensureCompatibleCloudFunctionVersion, ensureStaticResourceDirsDiffer, parseFirebaseConfiguration, validCloudFunctionName, validCloudRunServiceId} from '../../../src/utils.js';

// ParseFirebaseConfiguration: Valid configs
test(
	'Firebase config w Cloud Functions & single site',
	() => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('../fixtures/successes/cf_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJson), 'functions'), runtime: undefined}, cloudRun: false, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Functions & multiple sites',
	() => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('../fixtures/successes/cf_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJson), 'functions'), runtime: undefined}, cloudRun: false, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & single site',
	() => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('../fixtures/successes/cr_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudRun: {serviceId: 'some-service', region: 'us-central1'}, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		assert.equal(result, expectedResult);
	},
);

test(
	'Firebase config w Cloud Run & multiple sites',
	() => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('../fixtures/successes/cr_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudRun: {serviceId: 'some-service', region: 'us-central1'}, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		assert.equal(result, expectedResult);
	},
);

// ParseFirebaseConfiguration: Invalid configs
test(
	'Firebase config does not exist',
	() => {
		const firebaseJson = fileURLToPath(new URL('./does_not_exist.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1000 in README');
	},
);

test(
	'Firebase config is invalid json',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/invalid.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1001 in README');
	},
);

test(
	'Firebase config without "hosting" field',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/missing_hosting.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1010 in README');
	},
);

test(
	'Firebase config w multiple sites missing "site" identifier',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/sites_missing_rewrites.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1011 in README');
	},
);

test(
	'Firebase config w multiple sites require a "hostingSite" to be specified',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1012 in README');
	},
);

test(
	'Firebase config w multiple sites but no match found for a "hostingSite" specified in svelte.config.js adapter config',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: 'no_matching_site', sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1013 in README');
	},
);

test(
	'Firebase config w missing "public"',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/site_missing_public.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1050 in README');
	},
);

test('Firebase config w empty "public" string', () => {
	const firebaseJson = fileURLToPath(new URL('../fixtures/failures/site_empty_public.json', import.meta.url));
	const config = {sourceRewriteMatch: '**', firebaseJson};
	assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1052 in README');
});

test(
	'Firebase config w site missing "rewrites"',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/site_missing_rewrite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1020 in README');
	},
);

test(
	'Firebase config w "rewrites" mismatch',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cf_site_rewrite_mismatch.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: 'no_match', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1021 in README');
	},
);

test(
	'Firebase config w Cloud Run missing required "serviceId" field',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cr_missing_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1030 in README');
	},
);

test(
	'Firebase config w Cloud Run incompatible serviceId field',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cr_invalid_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1031 in README');
	},
);

test(
	'Firebase config w Cloud Run incompatible region field',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cr_invalid_region.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1032 in README');
	},
);

test(
	'Firebase config w Cloud Function invalid name',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cf_invalid_function_name.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1040 in README');
	},
);

test(
	'Firebase config w Cloud Functions & single site missing top-level functions',
	() => {
		const firebaseJson = fileURLToPath(new URL('../fixtures/failures/cf_site_missing_functions.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		assert.throws(() => parseFirebaseConfiguration(config), 'See above output. See Hint code SAF1060 in README');
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
		assert.throws(() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'a'}), 'See above output. See Hint code SAF1051 in README');
	},
);

// EnsureCompatibleCloudFunctionVersion
test('Valid Function runtime (nodejs14) version in package.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '14'}));
});
test('Valid Function runtime (nodejs14) version in firebase.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs14'}));
});
test('Valid Function runtime (nodejs16) version in package.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '16'}));
});
test('Valid Function runtime (nodejs16) version in firebase.json', () => {
	assert.not.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs16'}));
});

test(
	'No Function runtime provided',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({}), 'See above output. See Hint code SAF1061 in README');
	},
);
test(
	'Invalid Function runtime in package.json',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '12'}), 'See above output. See Hint code SAF1061 in README');
	},
);
test(
	'Invalid Function runtime in firebase.json',
	() => {
		assert.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs12'}), 'See above output. See Hint code SAF1061 in README');
	},
);

test.run();
