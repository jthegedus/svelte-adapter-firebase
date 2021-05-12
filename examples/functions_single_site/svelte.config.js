import firebaseAdapter from 'svelte-adapter-firebase';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Hydrate the <div id="svelte"> element in src/app.html
		adapter: firebaseAdapter(),
		target: '#svelte'
	}
};

export default config;
