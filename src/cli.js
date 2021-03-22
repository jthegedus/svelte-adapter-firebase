const {copyFileSync, readFileSync, renameSync, writeFileSync} = require('fs');
const path = require('path');
const {copyFileIfExistsSync, parseFirebaseConfiguration} = require('./utils.js');

/**
 * @param {{
 * 	hostingSite?: string;
 * 	sourceRewriteMatch?: string,
 * 	firebaseJson?: string,
 * 	cloudRunBuildDir?: string
 * }} options
 */
module.exports = function ({
	firebaseJson = 'firebase.json',
	hostingSite = undefined,
	sourceRewriteMatch = '**',
	cloudRunBuildDir = undefined
} = {}) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'svelte-adapter-firebase',
		async adapt(builder) {
			const {functions, cloudRun, publicDir} = parseFirebaseConfiguration({hostingSite, sourceRewriteMatch, firebaseJson});

			if (functions !== false) {
				adaptToCloudFunctions({builder, ...functions});
			}

			if (cloudRun !== false) {
				adaptToCloudRun({builder, ...cloudRun, cloudRunBuildDir});
			}

			builder.log.info(`Writing client application to ${publicDir}`);
			builder.copy_static_files(publicDir);
			builder.copy_client_files(publicDir);

			builder.log.info(`Prerendering static pages to ${publicDir}`);
			await builder.prerender({dest: publicDir});
		}
	};

	return adapter;
};

/**
 *
 * @param {{builder: any, name: string, source: string}} param0
 */
function adaptToCloudFunctions({builder, name, source}) {
	const functionsPackageJson = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf-8'));
	const functionsMain = functionsPackageJson?.main;
	if (!functionsMain) {
		throw new Error(`Error reading ${functionsPackageJson}. Required field "main" missing.`);
	}

	const ssrDirname = name ?? 'svelteKit';
	const serverOutputDir = path.join(source, path.dirname(functionsMain), ssrDirname);

	builder.log.minor(`Writing Cloud Function server assets to ${serverOutputDir}`);
	builder.copy_server_files(serverOutputDir);

	// Prepare handler & entrypoint
	renameSync(path.join(serverOutputDir, 'app.js'), path.join(serverOutputDir, 'app.mjs'));
	copyFileSync(path.join(__dirname, 'files', 'index.js'), path.join(serverOutputDir, 'index.js'));
	copyFileSync(path.join(__dirname, 'files', 'handler.mjs'), path.join(serverOutputDir, 'handler.mjs'));
	copyFileSync(path.join(__dirname, 'files', 'handler.mjs.map'), path.join(serverOutputDir, 'handler.mjs.map'));

	// Prepare Cloud Function
	const functionsEntrypoint = path.join(source, functionsMain);
	try {
		const ssrSvelteFunctionName = ssrDirname.replace(/\W/g, '').concat('Server');
		if (!readFileSync(functionsEntrypoint, 'utf-8').includes(`${name} =`)) {
			builder.log.warn(
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
 * @param {{builder: any, serviceId: string, region: string, cloudRunBuildDir: string|undefined}} param0
 */
function adaptToCloudRun({builder, serviceId, region, cloudRunBuildDir}) {
	const serverOutputDir = path.join(cloudRunBuildDir || `.${serviceId}`);

	builder.log.info(`Writing Cloud Run service to ./${serverOutputDir}`);
	builder.copy_server_files(serverOutputDir);

	// Prepare handler & entrypoint
	renameSync(path.join(serverOutputDir, 'app.js'), path.join(serverOutputDir, 'app.mjs'));
	copyFileSync(path.join(__dirname, 'files', 'index.js'), path.join(serverOutputDir, 'index.js'));
	copyFileSync(path.join(__dirname, 'files', 'handler.mjs'), path.join(serverOutputDir, 'handler.mjs'));
	copyFileSync(path.join(__dirname, 'files', 'handler.mjs.map'), path.join(serverOutputDir, 'handler.mjs.map'));

	// Prepare Cloud Run package.json - read SvelteKit App 'package.json', modify the JSON, write to serverOutputDir
	const pkgjson = JSON.parse(readFileSync('package.json', 'utf-8'));
	pkgjson.scripts.start = 'functions-framework --target=default';
	pkgjson.dependencies['@google-cloud/functions-framework'] = '^1.7.1'; // Peer-dep of this adapter instead?
	pkgjson.engines = {node: '14'};
	delete pkgjson.type;
	const data = JSON.stringify(pkgjson, null, 2);
	writeFileSync(path.join(serverOutputDir, 'package.json'), data);

	// Copy lockfile for deps install during image build
	copyFileIfExistsSync('package-lock.json', serverOutputDir);
	copyFileIfExistsSync('npm-shrinkwrap.json', serverOutputDir);
	copyFileIfExistsSync('yarn.lock', serverOutputDir);
	copyFileIfExistsSync('pnpm-lock.yaml', serverOutputDir);

	builder.log.warn(
		// eslint-disable-next-line indent
`To deploy your Cloud Run service, run this command:
+--------------------------------------------------+
gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated
+--------------------------------------------------+`
	);
}
