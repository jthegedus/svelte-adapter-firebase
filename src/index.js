import {copyFileSync, existsSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {parseFirebaseConfiguration} from './utils.js';

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

			builder.log.warn(`Writing client application to ${publicDir}`);
			builder.copy_static_files(publicDir);
			builder.copy_client_files(publicDir);

			builder.log.warn(`Prerendering static pages to ${publicDir}`);
			await builder.prerender({dest: publicDir});
		}
	};
}

/**
 *
 * @param {{builder: any, name: string, source: string}} param0
 */
function adaptToCloudFunctions({builder, name, source}) { // eslint-disable-line no-unused-vars
	throw new Error('Cloud Function SSR not supported at this time. Please use Cloud Run rewrite configuration - see docs https://firebase.google.com/docs/hosting/cloud-run#direct_requests_to_container');
}

/**
 *
 * @param {{builder: any, serviceId: string, region: string, cloudRunBuildDir: string|undefined}} param0
 */
function adaptToCloudRun({builder, serviceId, region, cloudRunBuildDir}) {
	const serverOutputDir = path.join(cloudRunBuildDir || `.${serviceId}`);

	builder.log.warn(`Writing Cloud Run service to ./${serverOutputDir}`);
	builder.copy_server_files(serverOutputDir);

	// Copy package.json and lockfile. Support npm (npm-shrinkwrap & package-lock), pnpm, yarn
	copyFileSync(path.resolve('package.json'), `${serverOutputDir}/package.json`);
	copyFileIfExistsSync('package-lock.json', serverOutputDir);
	copyFileIfExistsSync('npm-shrinkwrap.json', serverOutputDir);
	copyFileIfExistsSync('pnpm-lock.yaml', serverOutputDir);
	copyFileIfExistsSync('yarn.lock', serverOutputDir);
	// Write Dockerfile
	copyFileSync(path.resolve(path.join(__dirname, 'files', 'Dockerfile')), `${serverOutputDir}/Dockerfile`);
	copyFileSync(path.resolve(path.join(__dirname, 'files', '.dockerignore')), `${serverOutputDir}/.dockerignore`);

	builder.log.warn(
		// eslint-disable-next-line indent
`To deploy your Cloud Run service, run this command:
+--------------------------------------------------+
gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated --project <YOUR_PROJECT>
+--------------------------------------------------+`
	);
}

function copyFileIfExistsSync(filename, destDir) {
	if (existsSync(path.resolve(filename))) {
		copyFileSync(path.resolve(filename), path.join(destDir, filename));
	}
}

export default adapter;
