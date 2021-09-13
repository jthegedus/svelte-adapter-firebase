import {existsSync, readFileSync} from 'fs';
import path from 'path';
import process from 'process';
import kleur from 'kleur';

/**
 * @typedef CloudRunRewriteConfig
 * @type {object} cloudrun
 * @property {undefined|string} cloudrun.serviceId
 * @property {undefined|'us-west1'} cloudrun.region
 */

/**
 * @typedef HostingRewriteConfig
 * @type {object} rewrite
 * @property {undefined|string} rewrite.source
 * @property {undefined|string} rewrite.function
 * @property {undefined|CloudRunRewriteConfig} rewrite.run
 */

/**
 * @typedef HostingConfig
 * @type {object} hosting
 * @property {undefined|string} hosting.site
 * @property {undefined|string} hosting.public
 * @property {undefined|Array.<HostingRewriteConfig>} hosting.rewrites
 */

/**
 * @typedef FunctionsConfig
 * @type {object} functions
 * @property {undefined|string} functions.source
 * @property {undefined|'nodejs14'|'nodejs16'} functions.runtime
*/

/**
 * Firebase configuration from `firebase.json`. Typed with the types required by the adapter.
 *
 * @typedef FirebaseConfig
 * @type {object} config
 * @property {undefined|HostingConfig|Array.<HostingConfig>} hosting
 * @property {undefined|FunctionsConfig} functions
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
 *
 * @param {{
 * 	hostingSite: string|undefined;
 * 	sourceRewriteMatch: string;
 * 	firebaseJsonPath: string
 * }} param
 * @returns {{
 * 	functions: { name: string, source: string, runtime: string | undefined };
 * 	publicDir: string
 * }} Functions config with `public` dir
 */
function parseFirebaseConfiguration({hostingSite, sourceRewriteMatch, firebaseJsonPath}) {
	const firebaseJson = path.resolve(firebaseJsonPath);
	if (!existsSync(firebaseJson)) {
		logErrorThrow({
			why: 'File does not exist',
			got: `${kleur.italic(firebaseJson)}`,
			hint: `The adapter requires a ${kleur.italic('firebase.json')} file. The above file is computed using the adapter config: firebaseJson. If the default adapter config is not working, consider updating it in ${kleur.italic('svelte.config.js')}`,
			docs: 'https://github.com/jthegedus/svelte-adapter-firebase#configuration-overview',
			hintCode: 1000,
		},
		);
	}

	/**
	 * @type {FirebaseConfig}
	 */
	let firebaseConfig;
	try {
		firebaseConfig = JSON.parse(readFileSync(firebaseJson, 'utf-8'));
	} catch (error) {
		logErrorThrow({
			why: `Error parsing ${kleur.italic('firebase.json')}`,
			got: error.message,
			docs: 'https://jsonlint.com/ & https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse',
			hintCode: 1001,
		});
	}

	if (!firebaseConfig?.hosting) {
		logErrorThrow({
			why: 'Required field missing from Firebase Configuration file.',
			got: Object.keys(firebaseConfig) && `fields ${kleur.bold(Object.keys(firebaseConfig).toString())}`,
			wanted: `${kleur.bold('"hosting"')}`,
			hint: 'Add the field or fix the typo in your ' + kleur.italic('firebase.json') + ' file',
			docs: 'https://firebase.google.com/docs/hosting/full-config#firebase-json_example',
			hintCode: 1010,
		});
	}

	// Force "hosting" field to be array
	const firebaseHostingConfig = Array.isArray(firebaseConfig.hosting) ? firebaseConfig.hosting : [{...firebaseConfig.hosting}];

	// Force "site" field to be included in "hosting" if more than 1 hosting site config
	if (firebaseHostingConfig.length > 1) {
		for (const item of firebaseHostingConfig) {
			if (!item.site) {
				logErrorThrow({
					why: `Multiple hosting configurations found, which requires each to have a ${kleur.bold('"site"')} field, one does not.`,
					got: `\n${kleur.bold(JSON.stringify(item, null, 2))}`,
					wanted: `Field named ${kleur.bold('"site": "<site_name>"')}`,
					hint: 'Add the "site" field to the above Hosting Configuration in ' + kleur.italic('firebase.json'),
					docs: 'https://firebase.google.com/docs/hosting/multisites',
					hintCode: 1011,
				});
			}
		}
	}

	const hostingConfig = firebaseHostingConfig.length === 1
		? firebaseHostingConfig[0]
		: firebaseHostingConfig.find(item => item.site === hostingSite);

	if (!hostingConfig) {
		if (!hostingSite) {
			logErrorThrow({
				why: `Multiple ${kleur.bold('hosting')} configurations found in ${kleur.italic('firebase.json')} but no ${kleur.bold('hostingSite')} specified in ${kleur.italic('svelte.config.js')} adapter config.`,
				got: kleur.bold(`"hostingSite": ${hostingSite}`),
				wanted: kleur.bold('"hostingSite": "<site_name>"') + ` in ${kleur.italic('svelte.config.js')} adapter config`,
				docs: 'https://github.com/jthegedus/svelte-adapter-firebase#configuration-overview',
				hintCode: 1012,
			});
		}

		const hostingConfigSiteValues = firebaseHostingConfig.map(item => ({site: item.site}));
		logErrorThrow({
			why: `Multiple ${kleur.bold('hosting')} configurations found in ${kleur.italic('firebase.json')} but no match found for ${kleur.bold('hostingSite')} specified in ${kleur.italic('svelte.config.js')} adapter config.`,
			got: `"hosting[].site" values -\n${kleur.bold(JSON.stringify(hostingConfigSiteValues, null, 2))}`,
			wanted: `One to be ${kleur.bold(`{"site": "${hostingSite}"}`)}`,
			hint: `Update adapter config "${kleur.bold('hostingSite')}" in ${kleur.italic('svelte.config.js')} to match one of the above Hosting configs.`,
			docs: 'https://github.com/jthegedus/svelte-adapter-firebase#configuration-overview',
			hintCode: 1013,
		});
	}

	if (!isString(hostingConfig?.public)) {
		logErrorThrow({
			why: 'Required "hosting.public" field not found for hosting configuration',
			got: `Hosting Configuration -\n${JSON.stringify(hostingConfig, null, 2)}`,
			wanted: '"public": "<some_dir>"',
			hint: 'Add a "public" field to the matched hosting config in firebase.json',
			docs: 'https://firebase.google.com/docs/hosting/full-config#public',
			hintCode: 1050,
		});
	}

	if (isString(hostingConfig?.public) && hostingConfig.public === '') {
		logErrorThrow({
			why: 'Required "hosting.public" field is an empty string',
			got: `Hosting Configuration -\n${JSON.stringify(hostingConfig, null, 2)}`,
			wanted: '"public": "<some_non_empty_dir_name>"',
			hint: '"public" should be a directory name',
			docs: 'https://firebase.google.com/docs/hosting/full-config#public',
			hintCode: 1052,
		});
	}

	if (!Array.isArray(hostingConfig?.rewrites)) {
		logErrorThrow({
			why: 'Required "hosting[].rewrites" field not found for matched hosting configuration',
			got: `Hosting Configuration -\n${JSON.stringify(hostingConfig, null, 2)}`,
			wanted: '"rewrites": [{...}]',
			hint: `Hosting conifig requires a rewrites array with either Cloud Run or Cloud Function with rewrite rule matching "source":"${sourceRewriteMatch}"`,
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-functions',
			hintCode: 1020,
		});
	}

	const rewriteConfig = hostingConfig.rewrites.find(item => item.source === sourceRewriteMatch && (item.function || item.run));

	if (!rewriteConfig) {
		logErrorThrow({
			why: `Required "hosting[].rewrites[]" does not contain a config with "source":"${sourceRewriteMatch} and either "function":"<func_name>" or "run":{...} entries`,
			got: `Hosting Configuration -\n${JSON.stringify(hostingConfig, null, 2)}`,
			wanted: '"rewrites": [{...}]',
			hint: `Hosting conifig requires a rewrites array with rules for either Cloud Run or Cloud Function with "source":"${sourceRewriteMatch}"`,
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-functions',
			hintCode: 1021,
		});
	}

	if (rewriteConfig?.run && (!rewriteConfig.run.serviceId || !isString(rewriteConfig.run.serviceId))) {
		logErrorThrow({
			why: 'Required "serviceId" field not found for Cloud Run rewrite rule in firebase.json',
			got: `Rewrite rule -\n${JSON.stringify(rewriteConfig, null, 2)}`,
			wanted: '"serviceId": "<cloud run service name>"',
			hint: 'Add the field or fix the typo for the rewrite rule in the ' + kleur.italic('firebase.json') + ' file',
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container',
			hintCode: 1030,
		});
	}

	if (rewriteConfig?.run && !validCloudRunServiceId(rewriteConfig.run.serviceId)) {
		logErrorThrow({
			why: 'Cloud Run "serviceId" is invalid',
			got: `${rewriteConfig.run.serviceId}`,
			hint: 'Cloud Run "serviceId" must use only lowercase alphanumeric characters and dashes, cannot begin or end with a dash, and cannot be longer than 63 characters. Update ' + kleur.italic('firebase.json') + ' accordingly.',
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container',
			hintCode: 1031,
		});
	}

	if (rewriteConfig?.run && rewriteConfig?.run?.region && (rewriteConfig?.run?.region !== 'us-west1')) {
		logErrorThrow({
			why: 'Cloud Run "region" is invalid',
			got: `\n${JSON.stringify(rewriteConfig.run, null, 2)}`,
			wanted: 'must be us-west1',
			hint: `Firebase Hosting rewrites with Cloud Run only supports specific regions. Update ${kleur.italic('firebase.json')} accordingly.`,
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container',
			hintCode: 1032,
		});
	}

	if (rewriteConfig?.function && !validCloudFunctionName(rewriteConfig.function)) {
		logErrorThrow({
			why: 'Function name for rewrite rule is invalid',
			got: `\n${JSON.stringify(rewriteConfig.function, null, 2)}`,
			hint: 'Function name must use only alphanumeric characters and underscores and cannot be longer than 62 characters. Update ' + kleur.italic('firebase.json') + ' accordingly.',
			docs: 'https://firebase.google.com/docs/hosting/full-config#rewrite-functions',
			hintCode: 1040,
		});
	}

	// If function, ensure function root-level field is present
	if (rewriteConfig?.function && (!firebaseConfig?.functions || !firebaseConfig.functions?.source || !isString(firebaseConfig.functions.source))) {
		logErrorThrow({
			why: 'Required "functions.source" field missing from Firebase Configuration file',
			got: `Firebase Configuration -\n${JSON.stringify(firebaseConfig, null, 2)}`,
			wanted: `${kleur.bold('"functions": { "source": "<functions dir>"}')}`,
			hint: 'Add the field or fix the typo in your ' + kleur.italic('firebase.json') + ' file',
			docs: 'https://firebase.google.com/docs/functions/manage-functions#deploy_functions',
			hintCode: 1060,
		});
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
 * - max length 62 chars
 * @param {string} name
 * @returns {boolean} `true` if valid
 *
 * Rules a combination of
 * - https://github.com/firebase/firebase-tools/blob/1633f4fccbbc1bcbc6216fe13b8e888c8940bde4/src/deploy/functions/validate.ts#L38
 * - https://github.com/firebase/firebase-tools/blob/2dc7216a498dee2ca7e2acc33d6ba16d5647e27f/src/extractTriggers.js#L18
 */
function validCloudFunctionName(name) {
	return /^\w{1,62}$/.test(name);
}

/**
 * Ensure provided static asset output dir (firebase.json:hosting.public) is not the same as the source dir
 * @param {{
 * 	dest:string
 * 	source:string
 * }} param source and destination directory for static assets
 */
function ensureStaticResourceDirsDiffer({source, dest}) {
	if (source === dest) {
		logErrorThrow({
			why: 'firebase.json:hosting.public must be a different directory to svelte.config.js:kit.files.assets',
			hint: 'Ideally keep svelte.config.js kit.files.assets as "static" and firebase.json:hosting.public as "public"',
			docs: 'https://github.com/jthegedus/svelte-adapter-firebase/issues/22#issuecomment-831170396',
			hintCode: 1051,
		});
	}
}

/**
 *
 * @param {{
 * 	functionsPackageJsonEngine: string | undefined
 * 	firebaseJsonFunctionsRuntime: string | undefined
 * }} param
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
		logErrorThrow({
			why: `Node.js runtime not supported. SvelteKit on Cloud Functions requires one of runtime: ${validFirebaseJsonValues}`,
			hint: `Set this in "package.json:engines.node" with one of "${validPackageJsonValues}" or "firebase.json:functions.runtime" with one of "${validFirebaseJsonValues}"`,
			docs: 'https://firebase.google.com/docs/functions/manage-functions#set_nodejs_version',
			hintCode: 1061,
		});
	}
}

/**
 * Format message with relative dir on following newline.
 *
 * @param {string} message
 * @param {string} dir
 * @returns {string} formatted message with relative dir on following newline
 */
function logRelativeDir(message, dir) {
	return `${message}:\n\t${kleur.italic(path.relative(process.cwd(), dir))}`;
}

/**
 * Log formatted error before `throw new Error()`
 *
 * @param {{
 * 	why: string,
 * 	got?: string,
 * 	wanted?: string,
 * 	hint?: string,
 * 	docs: string,
 * 	hintCode: number,
 * }} params
 */
function logErrorThrow({why, got, wanted, hint, docs, hintCode}) {
	console.log();
	console.log(kleur.red(`  Error: ${why}`));

	if (got) {
		console.log(`  Got: ${got}`);
	}

	if (wanted) {
		console.log(`  Wanted: ${wanted}`);
	}

	if (hint) {
		console.log(kleur.blue(`  Hint: ${hint}`));
	}

	console.log(`  See docs: ${docs}`);
	console.log();
	throw new Error(`See above output. See Hint code SAF${hintCode} in README`);
}

export {
	ensureCompatibleCloudFunctionVersion,
	ensureStaticResourceDirsDiffer,
	logRelativeDir,
	parseFirebaseConfiguration,
	validCloudRunServiceId,
	validCloudFunctionName,
};
