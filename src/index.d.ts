import {Adapter} from '@sveltejs/kit';
import {BuildOptions} from 'esbuild';

type AdapterOptions = {
	esbuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
	firebaseJsonPath?: string;
	hostingSite?: string;
	sourceRewriteMatch?: string;
};

declare function plugin(options?: AdapterOptions): Adapter;

export = plugin;
