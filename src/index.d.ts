type BuildOptions = import('esbuild').BuildOptions;
declare function plugin(
	options: {
		hostingSite?: string;
		sourceRewriteMatch?: string;
		firebaseJson?: string;
		cloudRunBuildDir?: string;
		esbuild?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
	}
): import('@sveltejs/kit').Adapter;

export = plugin;
