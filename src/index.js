// Import {copyFileSync, mkdirSync, writeFileSync, renameSync} from 'fs';
import path from 'path';
// Import {fileURLToPath} from 'url';
import {parseFirebaseConfiguration} from './utils.js';

// Const __dirname = path.dirname(fileURLToPath(import.meta.url));

function adapter() {
	return {
		/**
		 *
		 * @param {*} builder
		 * @param {{hostingSite:string|undefined,sourceRewriteMatch:string|undefined, firebaseJson:string|undefined, cloudRunBuildDir:string|undefined}|undefined} options
		 */
		async adapt(builder, options) {
			const defaultOptions = {
				firebaseJson: 'firebase.json',
				hostingSite: undefined,
				sourceRewriteMatch: '**',
				cloudRunBuildDir: undefined
			};
			const config = {...defaultOptions, ...options};
			const {functions, cloudrun, publicDir} = parseFirebaseConfiguration(config);

			if (functions !== false) {
				throw new Error('Cloud Function SSR not supported at this time. Please use Cloud Run rewrite configuration - see docs https://firebase.google.com/docs/hosting/cloud-run#direct_requests_to_container');
			}

			if (cloudrun !== false) {
				const serverOutputDir = path.join(
					config.cloudRunBuildDir || `.${cloudrun.serviceId}`
				);

				builder.log.minor(`Writing Cloud Run service to ./${serverOutputDir}`);
				builder.copy_server_files(serverOutputDir);
				// TODO: copy fils/* required for Cloud Run
				// "build:cloudrun": "mkdir -p dist/files && cp -p src/files/cloud_run_package.json dist/files/package.json",
				builder.log.warn(
					`To deploy your Cloud Run service, run this command:
		+--------------------------------------------------+
		gcloud beta run --platform managed --region ${cloudrun.region} deploy ${cloudrun.serviceId} --source ${serverOutputDir} --allow-unauthenticated
		+--------------------------------------------------+`
				);
			}

			builder.log.minor(`Writing client application to ${publicDir}`);
			builder.copy_static_files(publicDir);
			builder.copy_client_files(publicDir);

			builder.log.minor(`Prerendering static pages to ${publicDir}`);
			await builder.prerender({dest: publicDir});
		}
	};
}

export default adapter;
