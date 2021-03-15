import {existsSync, readFileSync, renameSync, writeFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {copy} from '@sveltejs/app-utils/files'; // eslint-disable-line node/file-extension-in-import
import {copyFileIfExistsSync, parseFirebaseConfiguration} from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function adapter() {
	return {
		/**
		 *
		 * @param {*} builder
		 * @param {{hostingSite: string|undefined,sourceRewriteMatch: string|undefined, firebaseJson: string|undefined, cloudRunBuildDir: string|undefined}|undefined} options
		 */
		async adapt(builder, options) {
			const defaultOptions = {
				firebaseJson: 'firebase.json',
				hostingSite: undefined,
				sourceRewriteMatch: '**',
				cloudRunBuildDir: undefined
			};
			const config = {...defaultOptions, ...options};
			const {functions, cloudRun, publicDir} = parseFirebaseConfiguration(config);

			if (functions !== false) {
				adaptToCloudFunctions({builder, ...functions});
			}

			if (cloudRun !== false) {
				adaptToCloudRun({builder, ...cloudRun, cloudRunBuildDir: config.cloudRunBuildDir});
			}

			builder.log.info(`Writing client application to ${publicDir}`);
			builder.copy_static_files(publicDir);
			builder.copy_client_files(publicDir);

			builder.log.info(`Prerendering static pages to ${publicDir}`);
			await builder.prerender({dest: publicDir});
		}
	};
}

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
	copy(path.join(__dirname, 'files'), serverOutputDir);

	// Prepare Cloud Function
	const functionsEntrypoint = path.join(source, functionsMain);
	try {
		const ssrSvelteFunctionName = ssrDirname.replace(/\W/g, '').concat('Server');
		if (existsSync(functionsEntrypoint) && !readFileSync(functionsEntrypoint, 'utf-8').includes(`${name} =`)) {
			builder.log.warn(
				// eslint-disable-next-line indent
`Add the following Cloud Function to ${functionsEntrypoint}
+--------------------------------------------------+
let ${ssrSvelteFunctionName};
exports.${name} = functions.https.onRequest(
	async (request, response) => {
		if (!${ssrSvelteFunctionName}) {
			functions.logger.info("Initializing SvelteKit SSR Handler");
			${ssrSvelteFunctionName} = require("./${ssrDirname}/index").svelteKit;
			functions.logger.info("SvelteKit SSR Handler initialised!");
		}
		return await ${ssrSvelteFunctionName}(request, response);
	}
);
+--------------------------------------------------+`
			);
		}
	} catch (error) {
		// TODO: fix
		throw error;
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
	copy(path.join(__dirname, 'files'), serverOutputDir);

	// Prepare Cloud Run package.json - read SvelteKit App 'package.json', modify the JSON, write to serverOutputDir
	const pkgjson = JSON.parse(readFileSync('package.json', 'utf-8'));
	pkgjson.scripts.start = 'functions-framework --target=svelteKit';
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
gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated --project <YOUR_PROJECT>
+--------------------------------------------------+`
	);
}

export default adapter;
