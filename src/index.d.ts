import {Adapter} from '@sveltejs/kit';
import {BuildOptions} from 'esbuild';

type Options = {
	esbuildOptions?: (defaultOptions: BuildOptions) => Promise<BuildOptions>;
	firebaseJsonPath?: string;
	target?: string;
	sourceRewriteMatch?: string;
};

export default function plugin(options?: Options): Adapter;
