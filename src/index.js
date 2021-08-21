import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import esbuild from 'esbuild';
import kleur from 'kleur';
import {
	copyFileIfExistsSync,
	ensureCompatibleCloudFunctionVersion,
	ensureStaticResourceDirsDiffer,
	logRelativeDir,
	parseFirebaseConfiguration
} from './utils.js';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/**
 * @param {{
 * 	hostingSite?: string;
 * 	sourceRewriteMatch?: string;
 * 	firebaseJson?: string;
 * 	cloudRunBuildDir?: string;
 * 	esbuildBuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
 * }} options
 **/
const entrypoint = function (options = {}) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'svelte-adapter-firebase',
		async adapt({utils, config}) {
			const {
				firebaseJson = 'firebase.json',
				hostingSite = undefined,
				sourceRewriteMatch = '**',
				cloudRunBuildDir = undefined,
				esbuildBuildOptions
			} = options;

			utils.log.minor(`Adapter configuration:\n\t${kleur.italic(JSON.stringify(options))}`);
			const {firebaseJsonDir, functions, cloudRun, publicDir} = parseFirebaseConfiguration({firebaseJson, hostingSite, sourceRewriteMatch});

			ensureStaticResourceDirsDiffer({source: path.join(process.cwd(), config.kit.files.assets), dest: publicDir});

			if (functions !== false) {
				await adaptToCloudFunctions({utils, esbuildBuildOptions, ...functions});
			}

			if (cloudRun !== false) {
				utils.log.info(kleur.bold('Cloud Run support may be deprecated in future. Comment why you need Cloud Run instead of Functions here - https://github.com/jthegedus/svelte-adapter-firebase/issues/118'));
				await adaptToCloudRun({utils, esbuildBuildOptions, firebaseJsonDir, cloudRunBuildDir, ...cloudRun});
			}

			utils.log.minor(logRelativeDir('Erasing static asset dir before processing', publicDir));
			utils.rimraf(publicDir);

			utils.log.minor(logRelativeDir('Writing client application to', publicDir));
			utils.copy_static_files(publicDir);
			utils.copy_client_files(publicDir);

			utils.log.minor(logRelativeDir('Prerendering static pages to', publicDir));
			await utils.prerender({dest: publicDir});
		}
	};

	return adapter;
};

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils;
 * 	esbuildBuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
 * 	name: string;
 * 	source: string;
 * 	runtime: string | undefined;
 * }} param
 */
async function adaptToCloudFunctions({utils, esbuildBuildOptions, name, source, runtime}) {
	const functionsPackageJson = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf-8'));
	const functionsMain = functionsPackageJson?.main;

	if (!functionsMain) {
		throw new Error(`Error reading ${functionsPackageJson}. Required field "main" missing.`);
	}

	ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: functionsPackageJson?.engines?.node, firebaseJsonFunctionsRuntime: runtime});

	const ssrDirname = name ?? 'svelteKit';
	const serverOutputDir = path.join(source, path.dirname(functionsMain), ssrDirname);

	await prepareEntrypoint({utils, esbuildBuildOptions, serverOutputDir});
	utils.log.minor(logRelativeDir('Writing Cloud Function server assets to', serverOutputDir));

	// Prepare Cloud Function
	const functionsEntrypoint = path.join(source, functionsMain);
	try {
		const ssrSvelteFunctionName = ssrDirname.replace(/\W/g, '') + 'Server';
		if (!readFileSync(functionsEntrypoint, 'utf-8').includes(`${name} =`)) {
			utils.log.info(`Add the following Cloud Function to ${functionsEntrypoint}`);
			utils.log.info(kleur.bold().cyan(`
let ${ssrSvelteFunctionName};
exports.${name} = functions.https.onRequest(async (request, response) => {
	if (!${ssrSvelteFunctionName}) {
		functions.logger.info("Initialising SvelteKit SSR entry");
		${ssrSvelteFunctionName} = require("./${ssrDirname}/index").default;
		functions.logger.info("SvelteKit SSR entry initialised!");
	}
	functions.logger.info("Requested resource: " + request.originalUrl);
	return ${ssrSvelteFunctionName}(request, response);
});

`));
		}
	} catch (error) {
		throw new Error(`Error reading Cloud Function entrypoint file: ${functionsEntrypoint}. ${error.message}`);
	}
}

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils;
 * 	esbuildBuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
 * 	serviceId: string;
 * 	region: string;
 * 	firebaseJsonDir: string;
 * 	cloudRunBuildDir: string|undefined;
 * }} param
 */
async function adaptToCloudRun({utils, esbuildBuildOptions, serviceId, region, firebaseJsonDir, cloudRunBuildDir}) {
	const serverOutputDir = path.join(firebaseJsonDir, cloudRunBuildDir || `.${serviceId}`);

	await prepareEntrypoint({utils, esbuildBuildOptions, serverOutputDir});
	utils.log.minor(logRelativeDir('Writing Cloud Run service to', serverOutputDir));

	// Prepare Cloud Run package.json - read SvelteKit App 'package.json', modify the JSON, write to serverOutputDir
	const pkgjson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
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

	utils.log.info(kleur.bold('To deploy your Cloud Run service, run both of these commands:'));
	utils.log.info(kleur.bold().cyan(`gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated && firebase deploy --only hosting`));
	utils.log.info(kleur.bold('Firebase deployment is required as your static assets and route manifests may have changed from this build.'));
}

/**
 *
 * @param {{
 * 	utils: import('@sveltejs/kit').AdapterUtils;
 * 	esbuildBuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
 * 	serverOutputDir: string;
 * }} param
 */
async function prepareEntrypoint({utils, esbuildBuildOptions, serverOutputDir}) {
	const temporaryDir = path.join('.svelte-kit', 'firebase');

	utils.rimraf(temporaryDir);
	utils.rimraf(serverOutputDir);

	const files = fileURLToPath(new URL('./files', import.meta.url));
	const entrySource = path.join(files, 'entry.js');
	const entryDest = path.join(temporaryDir, 'entry.js');
	utils.copy(entrySource, entryDest);
	const firebaseToSvelteKitSource = path.join(files, 'firebase-to-svelte-kit.js');
	const firebaseToSvelteKitDest = path.join(temporaryDir, 'firebase-to-svelte-kit.js');
	utils.copy(firebaseToSvelteKitSource, firebaseToSvelteKitDest);

	/** @type {BuildOptions} */
	const defaultOptions = {
		entryPoints: [path.join(temporaryDir, 'entry.js')],
		outfile: path.join(serverOutputDir, 'index.js'),
		bundle: true,
		inject: [path.join(files, 'shims.js')],
		platform: 'node'
	};

	const esbuildOptions = esbuildBuildOptions ? await esbuildBuildOptions(defaultOptions) : defaultOptions;

	await esbuild.build(esbuildOptions);
}

export default entrypoint;
