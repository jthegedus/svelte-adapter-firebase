declare function plugin(
	options: {
		hostingSite?: string;
		sourceRewriteMatch?: string;
		firebaseJson?: string;
		cloudRunBuildDir?: string;
	}
): import('@sveltejs/kit').Adapter;

export = plugin;
