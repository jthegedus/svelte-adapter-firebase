import firebase from 'svelte-adapter-firebase';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Hydrate the <div id="svelte"> element in src/app.html
		adapter: firebase(),
	}
};

export default config;
