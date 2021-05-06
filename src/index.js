import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {copyFileIfExistsSync, parseFirebaseConfiguration} from './utils.js';
import esbuild from 'esbuild';

/**
 * @param {{
 * 	hostingSite?: string;
 * 	sourceRewriteMatch?: string,
 * 	firebaseJson?: string,
 * 	cloudRunBuildDir?: string
 * }} options
 */
const entrypoint = function ({
	firebaseJson = 'firebase.json',
	hostingSite = undefined,
	sourceRewriteMatch = '**',
	cloudRunBuildDir = undefined
} = {}) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'svelte-adapter-firebase',
		async adapt(utils) {
			const {firebaseJsonDir, functions, cloudRun, publicDir} = parseFirebaseConfiguration({hostingSite, sourceRewriteMatch, firebaseJson});

			if (functions !== false) {
				await adaptToCloudFunctions({utils, ...functions});
			}

			if (cloudRun !== false) {
				await adaptToCloudRun({utils, ...cloudRun, firebaseJsonDir, cloudRunBuildDir});
			}

			utils.rimraf(publicDir);

			utils.log.minor(`Prerendering static pages to: ${publicDir}`);
			await utils.prerender({dest: publicDir});

			utils.log.minor(`Writing client application to: ${publicDir}`);
			utils.copy_static_files(publicDir);
			utils.copy_client_files(publicDir);
		}
	};

	return adapter;
};

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils,
 * 	name: string;
 * 	source: string;
 * }} param
 */
async function adaptToCloudFunctions({utils, name, source}) {
	const functionsPackageJson = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf-8'));
	const functionsMain = functionsPackageJson?.main;
	if (!functionsMain) {
		throw new Error(`Error reading ${functionsPackageJson}. Required field "main" missing.`);
	}

	const ssrDirname = name ?? 'svelteKit';
	const serverOutputDir = path.join(source, path.dirname(functionsMain), ssrDirname);

	await prepareEntrypoint({utils, serverOutputDir});
	utils.log.minor(`Writing Cloud Function server assets to: ${serverOutputDir}`);

	// Prepare Cloud Function
	const functionsEntrypoint = path.join(source, functionsMain);
	try {
		const ssrSvelteFunctionName = ssrDirname.replace(/\W/g, '').concat('Server');
		if (!readFileSync(functionsEntrypoint, 'utf-8').includes(`${name} =`)) {
			utils.log.warn(
				// eslint-disable-next-line indent
`Add the following Cloud Function to ${functionsEntrypoint}
+--------------------------------------------------+
let ${ssrSvelteFunctionName};
exports.${name} = functions.https.onRequest(async (request, response) => {
	if (!${ssrSvelteFunctionName}) {
		functions.logger.info("Initializing SvelteKit SSR Handler");
		${ssrSvelteFunctionName} = require("./${ssrDirname}/index").default;
		functions.logger.info("SvelteKit SSR Handler initialised!");
	}
	functions.logger.info("Requested resource: " + request.originalUrl);
	return await ${ssrSvelteFunctionName}(request, response);
});
+--------------------------------------------------+`
			);
		}
	} catch (error) {
		throw new Error(`Error reading Cloud Function entrypoint file: ${functionsEntrypoint}. ${error.message}`);
	}
}

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils,
 * 	serviceId: string;
 * 	region: string;
 * 	firebaseJsonDir: string
 * 	cloudRunBuildDir: string|undefined
 * }} param
 */
async function adaptToCloudRun({utils, serviceId, region, firebaseJsonDir, cloudRunBuildDir}) {
	const serverOutputDir = path.join(firebaseJsonDir, cloudRunBuildDir || `.${serviceId}`);

	await prepareEntrypoint({utils, serverOutputDir});
	utils.log.info(`Writing Cloud Run service to ./${serverOutputDir}`);

	// Prepare Cloud Run package.json - read SvelteKit App 'package.json', modify the JSON, write to serverOutputDir
	const pkgjson = JSON.parse(readFileSync(fileURLToPath(new URL('package.json', import.meta.url)), 'utf-8'));
	pkgjson.scripts.start = 'functions-framework --target=default';
	if (pkgjson.dependencies === undefined) {
		pkgjson.dependencies = {};
	}

	pkgjson.dependencies['@google-cloud/functions-framework'] = '^1.7.1';
	pkgjson.engines = {node: '14'};
	delete pkgjson.type;
	const data = JSON.stringify(pkgjson, null, 2);
	writeFileSync(path.join(serverOutputDir, 'package.json'), data);

	// Copy lockfile for deps install during image build
	copyFileIfExistsSync('package-lock.json', serverOutputDir);
	copyFileIfExistsSync('npm-shrinkwrap.json', serverOutputDir);
	copyFileIfExistsSync('yarn.lock', serverOutputDir);
	copyFileIfExistsSync('pnpm-lock.yaml', serverOutputDir);

	utils.log.warn(
		// eslint-disable-next-line indent
`To deploy your Cloud Run service, run this command:
+--------------------------------------------------+
gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated
+--------------------------------------------------+`
	);
}

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils,
 * 	serverOutputDir: string;
 * }} param
 */
async function prepareEntrypoint({utils, serverOutputDir}) {
	// TODO: SvelteKit may add utils.tmpdir() which would replace this hardcoded path
	const temporaryDir = path.join('.svelte-kit', 'firebase');

	utils.rimraf(temporaryDir);
	utils.rimraf(serverOutputDir);

	const handlerSource = path.join(fileURLToPath(new URL('./files', import.meta.url)), 'handler.js');
	const handlerDest = path.join(temporaryDir, 'handler.js');
	utils.copy(handlerSource, handlerDest);

	await esbuild.build({
		entryPoints: [path.join(temporaryDir, 'handler.js')],
		outfile: path.join(serverOutputDir, 'index.js'),
		bundle: true,
		platform: 'node'
	});
}

export default entrypoint;
