import {fileURLToPath} from 'node:url';
import path from 'node:path';
import test from 'ava';
import {ensureCompatibleCloudFunctionVersion, ensureStaticResourceDirsDiffer, parseFirebaseConfiguration, validCloudFunctionName, validCloudRunServiceId} from '../src/utils.js';

// ParseFirebaseConfiguration: Valid configs
test(
	'Firebase config w Cloud Functions & single site',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('./fixtures/successes/cf_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJson), 'functions'), runtime: undefined}, cloudRun: false, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		t.deepEqual(result, expectedResult);
	}
);

test(
	'Firebase config w Cloud Functions & multiple sites',
	t => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('./fixtures/successes/cf_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: {name: 'some_func', source: path.join(path.dirname(config.firebaseJson), 'functions'), runtime: undefined}, cloudRun: false, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		t.deepEqual(result, expectedResult);
	}
);

test(
	'Firebase config w Cloud Run & single site',
	t => {
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('./fixtures/successes/cr_site.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudRun: {serviceId: 'some-service', region: 'us-central1'}, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		t.deepEqual(result, expectedResult);
	}
);

test(
	'Firebase config w Cloud Run & multiple sites',
	t => {
		const config = {hostingSite: 'app', sourceRewriteMatch: '**', firebaseJson: fileURLToPath(new URL('./fixtures/successes/cr_sites.json', import.meta.url))};
		const result = parseFirebaseConfiguration(config);
		const expectedResult = {functions: false, cloudRun: {serviceId: 'some-service', region: 'us-central1'}, publicDir: path.join(path.dirname(config.firebaseJson), 'app'), firebaseJsonDir: path.dirname(config.firebaseJson)};

		t.deepEqual(result, expectedResult);
	}
);

// ParseFirebaseConfiguration: Invalid configs
test(
	'Firebase config does not exist',
	t => {
		const firebaseJson = fileURLToPath(new URL('./does_not_exist.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1000 in README');
	}
);

test(
	'Firebase config is invalid json',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/invalid.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1001 in README');
	}
);

test(
	'Firebase config without "hosting" field',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/missing_hosting.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1010 in README');
	}
);

test(
	'Firebase config w multiple sites missing "site" identifier',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/sites_missing_rewrites.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1011 in README');
	}
);

test(
	'Firebase config w multiple sites require a "hostingSite" to be specified',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1012 in README');
	}
);

test(
	'Firebase config w multiple sites but no match found for a "hostingSite" specified in svelte.config.js adapter config',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cf_multi_site_requires_hostingSite.json', import.meta.url));
		const config = {hostingSite: 'no_matching_site', sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1013 in README');
	}
);

test(
	'Firebase config w missing "public"',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/site_missing_public.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1050 in README');
	}
);

test('Firebase config w empty "public" string', t => {
	const firebaseJson = fileURLToPath(new URL('./fixtures/failures/site_empty_public.json', import.meta.url));
	const config = {sourceRewriteMatch: '**', firebaseJson};
	const error = t.throws(() => parseFirebaseConfiguration(config));
	t.is(error.message, 'See above output. See Hint code SAF1052 in README');
});

test(
	'Firebase config w site missing "rewrites"',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/site_missing_rewrite.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1020 in README');
	}
);

test(
	'Firebase config w "rewrites" mismatch',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cf_site_rewrite_mismatch.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: 'no_match', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1021 in README');
	}
);

test(
	'Firebase config w Cloud Run missing required "serviceId" field',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cr_missing_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1030 in README');
	}
);

test(
	'Firebase config w Cloud Run incompatible serviceId field',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cr_invalid_serviceId.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1031 in README');
	}
);

test(
	'Firebase config w Cloud Run incompatible region field',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cr_invalid_region.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1032 in README');
	}
);

test(
	'Firebase config w Cloud Function invalid name',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cf_invalid_function_name.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1040 in README');
	}
);

test(
	'Firebase config w Cloud Functions & single site missing top-level functions',
	t => {
		const firebaseJson = fileURLToPath(new URL('./fixtures/failures/cf_site_missing_functions.json', import.meta.url));
		const config = {hostingSite: undefined, sourceRewriteMatch: '**', firebaseJson};
		const error = t.throws(() => parseFirebaseConfiguration(config));
		t.is(error.message, 'See above output. See Hint code SAF1060 in README');
	}
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
	const error = t.notThrows(() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'b'}));
	t.is(error, undefined);
});

test(
	'Static asset source and dest the same dir',
	t => {
		const error = t.throws(() => ensureStaticResourceDirsDiffer({source: 'a', dest: 'a'}));
		t.is(error.message, 'See above output. See Hint code SAF1051 in README');
	}
);

// EnsureCompatibleCloudFunctionVersion
test('Valid Function runtime version in package.json', t => {
	const error = t.notThrows(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '14'}));
	t.is(error, undefined);
});
test('Valid Function runtime version in firebase.json', t => {
	const error = t.notThrows(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs14'}));
	t.is(error, undefined);
});

test(
	'No Function runtime provided',
	t => {
		const error = t.throws(() => ensureCompatibleCloudFunctionVersion({}));
		t.is(error.message, 'See above output. See Hint code SAF1061 in README');
	}
);
test(
	'Invalid Function runtime in package.json',
	t => {
		const error = t.throws(() => ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: '12'}));
		t.is(error.message, 'See above output. See Hint code SAF1061 in README');
	}
);
test(
	'Invalid Function runtime in firebase.json',
	t => {
		const error = t.throws(() => ensureCompatibleCloudFunctionVersion({firebaseJsonFunctionsRuntime: 'nodejs12'}));
		t.is(error.message, 'See above output. See Hint code SAF1061 in README');
	}
);
