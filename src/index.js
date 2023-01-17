import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import process from 'process';
import {fileURLToPath} from 'url';
import esbuild from 'esbuild';
import {
	ensureStaticResourceDirsDiffer,
	logRelativeDir,
	parseFirebaseConfiguration,
} from './utils.js';

const adapterName = 'svelte-adapter-firebase';

/** @type {import('.')} **/
const entrypoint = function (options = {}) {
	return {
		name: adapterName,
		async adapt(builder) {
			const {
				esbuildOptions = undefined,
				firebaseJsonPath = 'firebase.json',
				target = undefined,
				sourceRewriteMatch = '**',
			} = options;

			builder.log.minor(`Adapter configuration:\n\t${JSON.stringify(options)}`);
			const {functions, publicDir} = parseFirebaseConfiguration({firebaseJsonPath, target, sourceRewriteMatch});
			ensureStaticResourceDirsDiffer({source: path.join(process.cwd(), builder.config.kit.files.assets), dest: publicDir});
			const functionsPackageJson = JSON.parse(readFileSync(path.join(functions.source, 'package.json'), 'utf8'));
			if (!functionsPackageJson?.main) {
				throw new Error(`Error reading ${functionsPackageJson}. Required field "main" missing.`);
			}

			const dirs = {
				files: fileURLToPath(new URL('files', import.meta.url)),
				serverDirname: functions.name ?? 'svelteKit',
				serverPath: path.join(functions.source, path.dirname(functionsPackageJson.main), functions.name ?? 'svelteKit'),
				tmp: builder.getBuildDirectory(adapterName),
			};
			const ssrFunc = {
				entrypoint: path.join(functions.source, functionsPackageJson.main),
				svelteSSR: dirs.serverDirname.replace(/\W/g, '') + 'Server',
			};

			const relativePath = path.posix.relative(dirs.tmp, builder.getServerDirectory());
			const runtimeVersion = functions.runtime || functionsPackageJson?.engines?.node || '18';
			builder.rimraf(dirs.tmp);
			builder.rimraf(dirs.serverPath);
			builder.copy(
				path.join(dirs.files, 'entry.js')
				, path.join(dirs.tmp, 'entry.js'), {
					replace: {SERVER: `${relativePath}/index.js`, MANIFEST: `${relativePath}/manifest.js`},
				});
			builder.copy(path.join(dirs.files, 'firebase-to-svelte-kit.js'), path.join(dirs.tmp, 'firebase-to-svelte-kit.js'));

			/** @type {esbuild.BuildOptions} */
			const defaultOptions = {
				entryPoints: [path.join(dirs.tmp, 'entry.js')],
				outfile: path.join(dirs.serverPath, 'index.js'),
				bundle: true,
				inject: [path.join(dirs.files, 'shims.js')],
				platform: 'node',
				target: `node${runtimeVersion}`,
			};

			const buildOptions = esbuildOptions
				? await esbuildOptions(defaultOptions)
				: defaultOptions;
			await esbuild.build(buildOptions);
			builder.log.minor(logRelativeDir('Writing Cloud Function server assets to', dirs.serverPath));

			try {
				if (!readFileSync(ssrFunc.entrypoint, 'utf8').includes(`${functions.name} =`)) {
					builder.log.warn(`Add the following Cloud Function to ${ssrFunc.entrypoint}`);
					builder.log.warn(`
              let ${ssrFunc.svelteSSR};
              exports.${functions.name} = functions.region("us-central1").https.onRequest(async (request, response) => {
                if (!${ssrFunc.svelteSSR}) {
                  functions.logger.info("Initialising SvelteKit SSR entry");
                  ${ssrFunc.svelteSSR} = require("./${dirs.serverDirname}/index").default;
                  functions.logger.info("SvelteKit SSR entry initialised!");
                }
                functions.logger.info("Requested resource: " + request.originalUrl);
                return ${ssrFunc.svelteSSR}(request, response);
              });
                  `);
				}
			} catch (error) {
				throw new Error(`Error reading Cloud Function entrypoint file: ${ssrFunc.entrypoint}. ${error.message}`);
			}

			builder.log.minor(logRelativeDir('Erasing destination static asset dir before processing', publicDir));
			builder.rimraf(publicDir);

			builder.log.minor(logRelativeDir('Writing client application to', publicDir));
			builder.writeClient(publicDir);

			builder.log.minor(logRelativeDir('Prerendering static pages to', publicDir));
			builder.writePrerendered(publicDir);
			writeFileSync(`${dirs.tmp}/manifest.js`, `export const manifest = ${builder.generateManifest({
				relativePath,
			})};\n`);
			builder.log.minor('Writing routes...');

			builder.mkdirp(`${dirs.tmp}/config`);
			writeFileSync(
				`${dirs.tmp}/config/routes.json`,
				JSON.stringify([
					{
						src: `/${builder.config.kit.appDir}/.+`,
						headers: {
							'cache-control': 'public, immutable, max-age=31536000',
						},
					},
					{
						handle: 'filesystem',
					},
				]),
			);
		},
	};
};

export default entrypoint;
