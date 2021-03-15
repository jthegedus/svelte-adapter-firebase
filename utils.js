import {copyFileSync, existsSync, readFileSync} from 'fs';
import path from 'path';

/**
 *
 * @param {any} param
 * @returns {boolean} true if param is a string
 */
function isString(parameter) {
	return (typeof parameter === 'string' || parameter instanceof String);
}

/**
 *
 * @param {{hostingSite:string|undefined, sourceRewriteMatch:string, firebaseJson:string}} param0
* @returns {{functions: boolean | {name: string, source: string}, cloudRun: boolean | {serviceId: string, region: string}, publicDir: string}}
 */
export function parseFirebaseConfiguration({hostingSite, sourceRewriteMatch, firebaseJson}) {
	if (!existsSync(firebaseJson)) {
		throw new Error(`File ${firebaseJson} does not exist. The provided file should exist and be a Firebase JSON config.`);
	}

	let firebaseConfig;
	try {
		firebaseConfig = JSON.parse(readFileSync(firebaseJson));
	} catch (error) {
		throw new Error(`Error parsing ${firebaseJson}. ${error.message}`);
	}

	if (!firebaseConfig?.hosting) {
		throw new TypeError(`Error with config ${firebaseJson}. "hosting" field required.`);
	}

	// Force "hosting" field to be array
	const firebaseHostingConfig = Array.isArray(firebaseConfig.hosting) ? firebaseConfig.hosting : [{...firebaseConfig.hosting}];

	// Force "site" field to be included in "hosting" if more than 1 hosting site config
	if (firebaseHostingConfig.length > 1) {
		for (const item of firebaseHostingConfig) {
			if (!item.site) {
				throw new Error(`Error with config ${firebaseJson}. "hosting" configs should identify their "site" name as Firebase supports multiple sites. This site config does not ${JSON.stringify(item)}`);
			}
		}
	}

	const hostingConfig = firebaseHostingConfig.length === 1 ?
		firebaseHostingConfig[0] :
		firebaseHostingConfig.find(item => item.site === hostingSite);

	if (!hostingConfig) {
		throw new Error(`Error with config ${firebaseJson}. No "hosting[].site" match for ${hostingSite}. Ensure your svelte.config.js adapter config "hostingSite" matches an item in your Firebase config.`);
	}

	if (!hostingConfig?.public || !isString(hostingConfig.public)) {
		throw new Error(`Error with config ${firebaseJson}. "hosting[].public" field is required and should be a string. Hosting config with error: ${JSON.stringify(hostingConfig)}`);
	}

	if (!hostingConfig?.rewrites || !Array.isArray(hostingConfig?.rewrites)) {
		throw new Error(`Error with config ${firebaseJson}. "hosting[].rewrites" field  required in hosting config and should be an array of object(s). Hosting config with error: ${JSON.stringify(hostingConfig)}`);
	}

	const rewriteConfig = hostingConfig.rewrites.find(item => {
		return item.source === sourceRewriteMatch && (item.function || item.run);
	});

	if (!rewriteConfig) {
		throw new Error(`Error with config ${firebaseJson}. "hosting[].rewrites[*]" does not contain a config with "source":"${sourceRewriteMatch}" and either "function" or "run". Is your "sourceRewriteMatch" in svelte.config.js correct?`);
	}

	if (rewriteConfig?.run && (!rewriteConfig.run.serviceId || !isString(rewriteConfig.run.serviceId))) {
		throw new Error(`Error with config ${firebaseJson}. Cloud Run rewrite configuration missing required field "serviceId". Rewrite config with error: ${JSON.stringify(rewriteConfig)}`);
	}

	if (rewriteConfig?.run && !validCloudRunServiceId(rewriteConfig.run.serviceId)) {
		throw new Error(`Error with config ${firebaseJson}. The "serviceId":"${rewriteConfig.run.serviceId}" must use only lowercase alphanumeric characters and dashes, cannot begin or end with a dash, and cannot be longer than 63 characters.`);
	}

	if (rewriteConfig?.run && rewriteConfig?.run?.region && rewriteConfig.run.region !== 'us-central1') {
		throw new Error(`Error with config ${firebaseJson}. Firebase Hosting rewrites only support "regions":"us-central1" (docs - https://firebase.google.com/docs/functions/locations#http_and_client-callable_functions). Change "${rewriteConfig.run.region}" accordingly.`);
	}

	if (rewriteConfig?.function && // If function, ensure function root-level field is present
		(!firebaseConfig?.functions || !firebaseConfig.functions?.source || !isString(firebaseConfig.functions.source))) {
		throw new Error(`Error with config ${firebaseJson}. If you're using Cloud Functions for your SSR rewrite rule, you need to define a "functions.source" field (of type string) at your config root.`);
	}

	return {
		functions: rewriteConfig?.function ? {
			name: rewriteConfig.function,
			source: firebaseConfig.functions.source
		} : false,
		cloudRun: rewriteConfig?.run ? {
			serviceId: rewriteConfig.run.serviceId,
			region: rewriteConfig.run?.region || 'us-central1'
		} : false,
		publicDir: hostingConfig.public
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
export function validCloudRunServiceId(serviceId) {
	return /^[a-z\d][a-z\d-]+[a-z\d]$/gm.test(serviceId) && serviceId.length < 64;
}

/**
 * Copy File If Exists (synchronously)
 * @param {string} filename source file path
 * @param {string} destDir destination directory
 */
export function copyFileIfExistsSync(filename, destDir) {
	if (existsSync(filename)) {
		copyFileSync(filename, path.join(destDir, filename));
	}
}
