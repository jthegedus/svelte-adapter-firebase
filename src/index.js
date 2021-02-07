const {existsSync, readFileSync} = require('fs');
const path = require('path');
const {copy} = require('@sveltejs/app-utils/files');
const Joi = require('joi');

// If valid config returns the config as JS Object, else throws error
function validateFirebaseConfig(firebaseJson, hostingSite, sourceRewriteMatch) {
	const schema = Joi.object().keys({
		hosting: Joi.array().items(
			Joi.object().keys({
				public: Joi.string().required(),
				site: Joi.string().when(
					'/hosting.length',
					{
						is: Joi.number().integer().positive().less(2),
						then: Joi.optional(),
						otherwise: Joi.required()
					}
				),
				// Firebase rewrite schema
				rewrites: Joi.array().items(
					Joi.object().keys({
						source: Joi.string(),
						regex: Joi.string(),
						// https://github.com/firebase/firebase-tools/blob/50efc2e6983f7b907d6792c8a9e3f8d1eac64591/src/deploy/functions/validate.ts#L36
						function: Joi.string().pattern(/^[\w-]{1,62}$/),
						run: Joi.object().keys({
							serviceId: Joi.string().required()
						}),
						destination: Joi.string(),
						dynamicLinks: Joi.boolean().invalid(false)
					}).xor('source', 'regex').xor(
						'function',
						'run',
						'destination',
						'dynamicLinks'
					)
				).min(1)
			})
		).single().required().has(
			// START: svelte-adapter-firebase required hosting values
			Joi.object().keys({
				public: Joi.string().required(),

				// If single site in hosting array
				//	then site is optional
				//	otherwise site is either a string || must match hostingSite if provided
				site: Joi.any().when(
					'/hosting.length',
					{
						is: Joi.number().integer().positive().less(2),
						then: Joi.string().optional(),
						otherwise: Joi.string().valid(
							hostingSite ? hostingSite : Joi.string()
						).required()
					}
				),
				rewrites: Joi.array().has(
					Joi.object().keys({
						source: Joi.string().valid(sourceRewriteMatch),
						regex: Joi.string().valid(sourceRewriteMatch),
						function: Joi.string(),
						run: Joi.object().keys({
							serviceId: Joi.string().required()
						})
					}).xor('source', 'regex').xor('function', 'run')
				)
			}).with('public', 'rewrites')
			// END
		),
		functions: Joi.object().keys({
			source: Joi.string()
		}).when(
			'/hosting',
			{
				is: Joi.array().has(
					Joi.object().keys({
						rewrites: Joi.array().has(
							Joi.object().keys({
								function: Joi.string().required()
							})
						).required()
					})
				),
				then: Joi.required(),
				otherwise: Joi.optional()
			}
		)
	});

	const {error, value} = schema.validate(
		JSON.parse(getFile(firebaseJson)),
		{allowUnknown: true}
	);

	if (error) {
		throw new Error(
			`${error.message}

Error with "${firebaseJson}" config.
Expected Hosting config for site:
	${hostingSite ?
		hostingSite :
		'"default" - did you mean to specify a specific site?'}
with config:
	"rewrites.*.source": "${sourceRewriteMatch}"
for either a Function or Cloud Run service.
`
		);
	}

	return value;
}

function getFile(filepath) {
	if (existsSync(filepath)) {
		try {
			return readFileSync(filepath, 'utf-8');
		} catch (error) {
			throw new Error(`Error reading ${filepath}: ${error.message}`);
		}
	} else {
		throw new Error(`File ${filepath} does not exist.`);
	}
}

async function adapter(
	builder,
	parameters
) {
	const {
		hostingSite = null,
		sourceRewriteMatch = '**',
		firebaseJson = 'firebase.json',
		cloudRunBuildDir = null
	} = parameters;
	// Joi.array.single converts the hosting field to an array if a single item is provided
	const firebaseConfig = validateFirebaseConfig(
		firebaseJson,
		hostingSite,
		sourceRewriteMatch
	);

	// @ this point Joi has validated that all required values are in the config file
	const firebaseSiteConfig =
		firebaseConfig.hosting.length === 1 ?
			firebaseConfig.hosting[0] : // Site field is optional for single site configs, so just grab first
			firebaseConfig.hosting.find(item => item.site === hostingSite);
	const firebaseRewriteConfig = firebaseSiteConfig.rewrites.find(item => {
		return item.source === sourceRewriteMatch && (item.function || item.run);
	});

	if (firebaseRewriteConfig.function) {
		const functionsSourceDir = firebaseConfig.functions.source;
		const functionsPackageJsonPath = path.join(functionsSourceDir, 'package.json');

		// Get "main" of package.json @ functions.source
		const functionsPackageJson = JSON.parse(getFile(functionsPackageJsonPath));
		if (!functionsPackageJson.main) {
			throw new Error(`"main" field missing from ${functionsPackageJsonPath}`);
		}

		// Write files to dir
		const ssrDirname = hostingSite ?? 'sveltekit';
		const serverOutputDir = path.join(
			path.join(functionsSourceDir, path.dirname(functionsPackageJson.main), ssrDirname)
		);
		builder.log.minor(
			`Writing Cloud Function server assets to ${serverOutputDir}`
		);
		builder.copy_server_files(serverOutputDir);
		copy(
			path.join(__dirname, './files/handler.js'),
			path.join(serverOutputDir, 'handler.js')
		);

		const functionsIndexPath = path.join(
			functionsSourceDir,
			functionsPackageJson.main
		);
		try {
			// Read functions index file to see if function is already included there,
			// if so, do not output anything
			const cloudFunctionName = firebaseRewriteConfig.function;
			const ssrSvelteFunctionName = ssrDirname.replace(/\W/g, '').concat(
				'Server'
			);
			if (
				existsSync(functionsIndexPath) &&
				!getFile(functionsIndexPath).includes(`${cloudFunctionName} =`)
			) {
				builder.log.info(
					`Add the following Cloud Function to ${functionsIndexPath}
+--------------------------------------------------+
let ${ssrSvelteFunctionName};
exports.${cloudFunctionName} = functions.https.onRequest(
	async (request, response) => {
		if (!${ssrSvelteFunctionName}) {
			functions.logger.info("Initializing SvelteKit SSR Handler");
			${ssrSvelteFunctionName} = require("./${ssrDirname}/handler").sveltekitServer;
			functions.logger.info("SvelteKit SSR Handler initialised!");
		}
		return await ${ssrSvelteFunctionName}(request, response);
	}
);
+--------------------------------------------------+`
				);
			}
		} catch {
			// TODO: Improve this warning or the flow around reading functions index file.
			builder.log.warn(`There was an issue reading file ${functionsIndexPath}`);
		}

		if (!JSON.stringify(functionsPackageJson).includes('@sveltejs/app-utils')) {
			builder.log.info(
				`\nAdd the required dependency to ${functionsPackageJsonPath}
+--------------------------------------------------+
"@sveltejs/app-utils": "next"
+--------------------------------------------------+`
			);
		}
	} else if (firebaseRewriteConfig.run) {
		const serverOutputDir = path.join(
			cloudRunBuildDir || `.${firebaseRewriteConfig.run.serviceId}`
		);

		builder.log.minor(`Writing Cloud Run service to ./${serverOutputDir}`);
		builder.copy_server_files(serverOutputDir);
		copy(path.join(__dirname, './files'), serverOutputDir);
		builder.log.info(
			`To deploy your Cloud Run service, run this command:
+--------------------------------------------------+
gcloud beta run --platform managed --region us-central1 deploy ${firebaseRewriteConfig.run.serviceId} --source ${serverOutputDir} --allow-unauthenticated
+--------------------------------------------------+`
		);
	} else {
		throw new Error(
			'This code path should be unreachable, please open an issue @ https://github.com/jthegedus/svelte-adatper-firebase/issues with debug information'
		);
	}

	const staticOutputDir = path.join(firebaseSiteConfig.public);
	builder.log.minor(`Writing client application to ${staticOutputDir}`);
	builder.copy_static_files(staticOutputDir);
	builder.copy_client_files(staticOutputDir);

	builder.log.minor(`Prerendering static pages to ${staticOutputDir}`);
	await builder.prerender({dest: staticOutputDir});
}

module.exports = adapter;
