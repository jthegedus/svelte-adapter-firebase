import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const config = [
	{
		input: 'src/cli.js',
		output: {
			format: 'cjs',
			exports: 'default',
			file: 'dist/cli.js'
		},
		plugins: [nodeResolve(), commonjs()]
	},
	{
		input: 'src/files/handler.js',
		output: {
			file: 'dist/files/handler.mjs',
			format: 'es',
			sourcemap: true,
			exports: 'default'
		},
		plugins: [nodeResolve(), commonjs()],
		external: [...require('module').builtinModules, './app.mjs']
	},
	{
		input: 'src/files/index.cjs',
		output: {
			file: 'dist/files/index.js'
		},
		external: './handler.mjs'
	}
];

export default config;
