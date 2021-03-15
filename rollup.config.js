import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const config = [
	{
		input: 'src/handler.js',
		output: {
			file: 'dist/handler.mjs',
			format: 'es',
			sourcemap: true,
			exports: 'default'
		},
		plugins: [nodeResolve(), commonjs()],
		external: [...require('module').builtinModules, './app.mjs']
	},
	{
		input: 'src/index.cjs',
		output: {
			file: 'dist/index.js'
		},
		external: './handler.mjs'
	}
];

export default config;
