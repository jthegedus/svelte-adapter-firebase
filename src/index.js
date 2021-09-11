import {readFileSync} from 'fs';
import path from 'path';
import process from 'process';
import {fileURLToPath} from 'url';
import esbuild from 'esbuild';
import kleur from 'kleur';
import {
	ensureCompatibleCloudFunctionVersion,
	ensureStaticResourceDirsDiffer,
	logRelativeDir,
	parseFirebaseConfiguration,
} from './utils.js';

/** @type {import('.')} **/
const entrypoint = function (options = {}) {
	return {
		name: 'svelte-adapter-firebase',
		async adapt({utils, config}) {
			const {
				firebaseJsonPath = 'firebase.json',
				hostingSite = undefined,
				sourceRewriteMatch = '**',
				esbuildOptions = undefined,
			} = options;

			utils.log.minor(`Adapter configuration:\n\t${kleur.italic(JSON.stringify(options))}`);
			const {functions, publicDir} = parseFirebaseConfiguration({firebaseJsonPath, hostingSite, sourceRewriteMatch});
			ensureStaticResourceDirsDiffer({source: path.join(process.cwd(), config.kit.files.assets), dest: publicDir});

			// START: Adapt to Cloud Function
			const functionsPackageJson = JSON.parse(readFileSync(path.join(functions.source, 'package.json'), 'utf-8'));
			if (!functionsPackageJson?.main) {
				throw new Error(`Error reading ${functionsPackageJson}. Required field "main" missing.`);
			}

			const files = fileURLToPath(new URL('./files', import.meta.url));
			const dirs = {
				serverDirname: functions.name ?? 'svelteKit',
				serverPath: path.join(functions.source, path.dirname(functionsPackageJson.main), functions.name ?? 'svelteKit'),
				tmp: path.join('.svelte-kit', 'firebase'),
			};
			const ssrFunc = {
				entrypoint: path.join(functions.source, functionsPackageJson.main),
				svelteSSR: dirs.serverDirname.replace(/\W/g, '') + 'Server',
			};

			ensureCompatibleCloudFunctionVersion({functionsPackageJsonEngine: functionsPackageJson?.engines?.node, firebaseJsonFunctionsRuntime: functions.runtime});
			utils.rimraf(dirs.tmp);
			utils.rimraf(dirs.serverPath);
			utils.copy(path.join(files, 'entry.js'), path.join(dirs.tmp, 'entry.js'));
			utils.copy(path.join(files, 'firebase-to-svelte-kit.js'), path.join(dirs.tmp, 'firebase-to-svelte-kit.js'));

			/** @type {esbuild.BuildOptions} */
			const defaultOptions = {
				entryPoints: [path.join(dirs.tmp, 'entry.js')],
				outfile: path.join(dirs.serverPath, 'index.js'),
				bundle: true,
				inject: [path.join(files, 'shims.js')],
				platform: 'node',
			};

			const buildOptions = esbuildOptions ? await esbuildOptions(defaultOptions) : defaultOptions;
			await esbuild.build(buildOptions);
			utils.log.minor(logRelativeDir('Writing Cloud Function server assets to', dirs.serverPath));

			// Prepare Cloud Function
			try {
				if (!readFileSync(ssrFunc.entrypoint, 'utf-8').includes(`${functions.name} =`)) {
					utils.log.info(`Add the following Cloud Function to ${ssrFunc.entrypoint}`);
					utils.log.info(kleur.bold().cyan(`
let ${ssrFunc.svelteSSR};
exports.${functions.name} = functions.https.onRequest(async (request, response) => {
	if (!${ssrFunc.svelteSSR}) {
		functions.logger.info("Initialising SvelteKit SSR entry");
		${ssrFunc.svelteSSR} = require("./${dirs.serverDirname}/index").default;
		functions.logger.info("SvelteKit SSR entry initialised!");
	}
	functions.logger.info("Requested resource: " + request.originalUrl);
	return ${ssrFunc.svelteSSR}(request, response);
});
		`));
				}
			} catch (error) {
				throw new Error(`Error reading Cloud Function entrypoint file: ${ssrFunc.entrypoint}. ${error.message}`);
			}
			// END: Adapt to Cloud Function

			utils.log.minor(logRelativeDir('Erasing destination static asset dir before processing', publicDir));
			utils.rimraf(publicDir);

			utils.log.minor(logRelativeDir('Writing client application to', publicDir));
			utils.copy_static_files(publicDir);
			utils.copy_client_files(publicDir);

			utils.log.minor(logRelativeDir('Prerendering static pages to', publicDir));
			await utils.prerender({dest: publicDir});
		},
	};
};

export default entrypoint;
