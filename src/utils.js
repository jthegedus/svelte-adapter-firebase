import {existsSync, readFileSync} from 'fs';
import path from 'path';
import process from 'process';

/**
 * @typedef CloudRunRewriteConfig
 * @type {object} cloudrun
 * @property {undefined|'us-west1'} cloudrun.region
 * @property {undefined|string} cloudrun.serviceId
 */

/**
 * @typedef HostingRewriteConfig
 * @type {object} rewrite
 * @property {undefined|string} rewrite.function
 * @property {undefined|CloudRunRewriteConfig} rewrite.run
 * @property {undefined|string} rewrite.source
 */

/**
 * @typedef HostingConfig
 * @type {object} hosting
 * @property {undefined|string} hosting.public
 * @property {undefined|Array.<HostingRewriteConfig>} hosting.rewrites
 * @property {undefined|string} hosting.site
 * @property {undefined|string} hosting.target
 */

/**
 * @typedef FunctionsConfig
 * @type {object} functions
 * @property {undefined|'nodejs14'|'nodejs16'} functions.runtime
 * @property {undefined|string} functions.source
*/

/**
 * Firebase configuration from `firebase.json`. Typed with the types required by the adapter.
 *
 * @typedef FirebaseConfig
 * @type {object} config
 * @property {undefined|FunctionsConfig} functions
 * @property {undefined|HostingConfig|Array.<HostingConfig>} hosting
 */

/**
 *
 * @param {any} parameter
 * @returns {boolean} true if param is a string
 */
function isString(parameter) {
	return (typeof parameter === 'string' || parameter instanceof String);
}

/**
 * Parse provided firebase.json to match against SvelteKit config for target & Rewrite rule.
 *
 * @param {{
 * 	firebaseJsonPath: string
 * 	sourceRewriteMatch: string;
 * 	target: string|undefined;
 * }} param
 * @returns {{
 * 	functions: { name: string, source: string, runtime: string | undefined };
 * 	publicDir: string
 * }} Functions config with `public` dir
 */
function parseFirebaseConfiguration({target, sourceRewriteMatch, firebaseJsonPath}) {
	const firebaseJson = path.resolve(firebaseJsonPath);

	if (!existsSync(firebaseJson)) {
		throw new Error(`Error: The adapter requires a "firebase.json" file. "firebaseJsonPath:${firebaseJsonPath}" does not exist.`);
	}

	/**
	 * @type {FirebaseConfig}
	 */
	let firebaseConfig;
	try {
		firebaseConfig = JSON.parse(readFileSync(firebaseJson, 'utf-8'));
	} catch (error) {
		throw new Error(`Error: failure while parsing ${firebaseJsonPath}. ${error.message}`);
	}

	if (!firebaseConfig?.hosting) {
		throw new Error('Error: "hosting" config missing from "firebase.json"');
	}

	// Force "hosting" field to be array
	const firebaseHostingConfig = Array.isArray(firebaseConfig.hosting)
		? firebaseConfig.hosting
		: [{...firebaseConfig.hosting}];

	// Force "site" field to be included in "hosting" if more than 1 hosting site config
	if (firebaseHostingConfig.length > 1) {
		for (const item of firebaseHostingConfig) {
			if (!item.site && !item.target) {
				throw new Error('Error: Multiple "hosting" configurations found, each requires either a "site" field or "target" field, one does not. https://firebase.google.com/docs/hosting/multisites');
			}
		}
	}

	const hostingConfig = firebaseHostingConfig.length === 1
		? firebaseHostingConfig[0]
		: firebaseHostingConfig.find(item => (item.site === target && item.site !== undefined) || (item.target === target && item.target !== undefined));

	if (!hostingConfig) {
		if (!target) {
			throw new Error('Error: Multiple "hosting" configurations found, but no "target" specified in "svelte.config.js" adapter config. Provide one so we can match the config correctly.');
		}

		const hostingConfigValues = firebaseHostingConfig.map(item => (item.target ? {target: item.target} : {site: item.site}));
		throw new Error(`Error: Multiple "hosting" configurations found in "firebase.json" but not match found for ${target} specified in "svelte.config.js" adapter config. "hosting[].site" & "hosting[].target" values ${JSON.stringify(hostingConfigValues)}`);
	}

	if (!isString(hostingConfig?.public)) {
		throw new Error('Error: Required "hosting.public" field not found for hosting configuration.');
	}

	if (isString(hostingConfig?.public) && hostingConfig.public === '') {
		throw new Error('Error: Required "hosting.public" field is an empty string, a directory is required.');
	}

	if (!Array.isArray(hostingConfig?.rewrites)) {
		throw new TypeError(`Error: Required "hosting[].rewrites" field not found for matched hosting configuration. Specify your Cloud Function with rewrite rule matching "source":"${sourceRewriteMatch}"`);
	}

	const rewriteConfig = hostingConfig.rewrites.find(item => item.source === sourceRewriteMatch && (item.function || item.run));

	if (!rewriteConfig) {
		throw new Error(`Error: Required "hosting[].rewrites[]" does not contain a config with "source":"${sourceRewriteMatch}" and either "function":"<func_name>" or "run":{...} entries`);
	}

	if (rewriteConfig?.run && (!rewriteConfig.run.serviceId || !isString(rewriteConfig.run.serviceId))) {
		throw new Error('Error: Required "serviceId" field not found for Cloud Run rewrite rule in "firebase.json"');
	}

	if (rewriteConfig?.run && !validCloudRunServiceId(rewriteConfig.run.serviceId)) {
		throw new Error('Error: Cloud Run "serviceId" must use only lowercase alphanumeric characters and dashes cannot begin or end with a dash, and cannot be longer than 63 characters.');
	}

	if (rewriteConfig?.run && rewriteConfig?.run?.region && (rewriteConfig?.run?.region !== 'us-west1')) {
		throw new Error('Error: Cloud Run "region" is invalid, it should be "use-west1".');
	}

	if (rewriteConfig?.function && !validCloudFunctionName(rewriteConfig.function)) {
		throw new Error('Error: Cloud Function name must use only alphanumeric characters and underscores and cannot be longer than 63 characters');
	}

	// If function, ensure function root-level field is present
	if (!firebaseConfig?.functions || !firebaseConfig.functions?.source || !isString(firebaseConfig.functions.source)) {
		throw new Error('Error: Required "functions.source" field is missing from Firebase Configuration file.');
	}

	return {
		functions: {
			name: rewriteConfig.function ?? rewriteConfig.run.serviceId,
			source: path.join(path.dirname(firebaseJson), firebaseConfig.functions.source),
			runtime: firebaseConfig.functions?.runtime,
		},
		publicDir: path.join(path.dirname(firebaseJson), hostingConfig.public),
	};
}

/**
 * Cloud Run Service ID rules:
 * - only lowercase alphanumeric characters and dashes
 * - cannot begin or end with a dash
 * - cannot be longer than 63 characters
 * @param {string} serviceId
 * @returns {boolean} `true` if valid
 */
function validCloudRunServiceId(serviceId) {
	return /^[a-z\d][a-z\d-]+[a-z\d]$/gm.test(serviceId) && serviceId.length < 64;
}

/**
 * Cloud Function name rules:
 * - alphanumeric
 * - underscore
 * - max length 63 chars
 * @param {string} name
 * @returns {boolean} `true` if valid
 *
 * Rules a combination of
 * - https://github.com/firebase/firebase-tools/blob/1633f4fccbbc1bcbc6216fe13b8e888c8940bde4/src/deploy/functions/validate.ts#L38
 * - https://github.com/firebase/firebase-tools/blob/2dc7216a498dee2ca7e2acc33d6ba16d5647e27f/src/extractTriggers.js#L18
 */
function validCloudFunctionName(name) {
	return /^\w{1,63}$/.test(name);
}

/**
 * Ensure provided static asset output dir (firebase.json:hosting.public) is not the same as the source dir.
 * Throw error if invalid.
 *
 * @param {{
 * 	dest:string
 * 	source:string
 * }} param source and destination directory for static assets
 */
function ensureStaticResourceDirsDiffer({source, dest}) {
	if (source === dest) {
		throw new Error(`Error: "firebase.json:hosting.public" field (${dest}) must be a different directory to "svelte.config.js:kit.files.assets" field (${source}).`);
	}
}

/**
 * Validate Cloud Function runtime Node.js version for use with SvelteKit.
 * Throw error if invalid.
 * Returns number part of input values.
 *
 * @param {{
 * 	functionsPackageJsonEngine: undefined|string;
 * 	firebaseJsonFunctionsRuntime: undefined|string;
 * }} version
 * @returns {string} number part of input value. Eg: input=nodejs14 return=14 || input=14 return=14
 */
function ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine, firebaseJsonFunctionsRuntime}) {
	const validPackageJsonValues = [
		'14',
		'16',
	];
	const validFirebaseJsonValues = [
		'nodejs14',
		'nodejs16',
	];

	const validPkgJsonVersion = validPackageJsonValues.includes(functionsPackageJsonEngine);
	const validFirebaseJsonVersion = validFirebaseJsonValues.includes(firebaseJsonFunctionsRuntime);

	if (!validPkgJsonVersion && !validFirebaseJsonVersion) {
		throw new Error(`Error: Node.js runtime not supported. SvelteKit on Cloud Functions requires either "firebase.json:functions.runtime" with one of ${validFirebaseJsonValues} or "functions/package.json:engines.node" with one of ${validPackageJsonValues}`);
	}

	return functionsPackageJsonEngine
		? functionsPackageJsonEngine.slice(-2)
		: firebaseJsonFunctionsRuntime.slice(-2);
}

/**
 * Format message with relative dir on following newline.
 *
 * @param {string} message
 * @param {string} dir
 * @returns {string} formatted message with relative dir on following newline
 */
function logRelativeDir(message, dir) {
	return `${message}:\n\t${path.relative(process.cwd(), dir)}`;
}

export {
	ensureCompatibleCloudFunctionVersion,
	ensureStaticResourceDirsDiffer,
	logRelativeDir,
	parseFirebaseConfiguration,
	validCloudRunServiceId,
	validCloudFunctionName,
};
