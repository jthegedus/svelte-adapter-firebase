export default [
	{
		input: "src/index.js",
		output: {
			dir: "dist",
			sourcemap: true,
			format: "cjs",
		},
	},
	{
		input: "src/files/handler.js",
		output: {
			dir: "dist/files",
			sourcemap: true,
			format: "cjs",
		},
	},
];
