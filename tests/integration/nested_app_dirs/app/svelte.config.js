import firebase from 'svelte-adapter-firebase';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: firebase({
			target: 'svelte-func-single-site',
			firebaseJsonPath: '../firebase.json'
		}),
	}
};

export default config;
