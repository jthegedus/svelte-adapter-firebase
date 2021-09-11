import {Adapter} from '@sveltejs/kit';
import {BuildOptions} from 'esbuild';

type AdapterOptions = {
	hostingSite?: string;
	sourceRewriteMatch?: string;
	firebaseJsonPath?: string;
	esbuild?: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions;
};

declare function plugin(options?: AdapterOptions): Adapter;

export = plugin;
