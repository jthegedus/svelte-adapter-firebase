<div align="center">

<!-- TODO: on 1.0.0 release, delete this section -->

| :warning: WARNING: this project is considered to be in ALPHA until SvelteKit is available for general use and the Adapter API is stable! |
| ---------------------------------------------------------------------------------------------------------------------------------------- |

<!-- END -->

![SvelteKit adapter Firebase social preview](assets/github-preview-svelte-adapter-firebase.png)

# svelte-adapter-firebase

[![GitHub Release](https://img.shields.io/github/release/jthegedus/svelte-adapter-firebase.svg?color=green)](https://github.com/jthegedus/svelte-adapter-firebase/releases) [![npm](https://img.shields.io/npm/v/svelte-adapter-firebase?color=green)](https://www.npmjs.com/package/svelte-adapter-firebase) [![Tests](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/test.yaml/badge.svg)](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/test.yaml) [![CodeQL](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/codeql-analysis.yaml/badge.svg)](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/codeql-analysis.yaml)

[Firebase](https://firebase.google.com/) adapter for [SvelteKit](https://github.com/sveltejs/kit).

Utilise the Firebase Hosting CDN with dynamic content served by SvelteKit on Cloud Functions or Cloud Run!

:heavy_check_mark: SSR on [Cloud Run](https://firebase.google.com/docs/hosting/cloud-run)</br>
:heavy_check_mark: SSR on [Cloud Functions](https://firebase.google.com/docs/hosting/functions)</br>
:heavy_check_mark: Integrates with existing [JavaScript ~or TypeScript~ Cloud Functions](https://firebase.google.com/docs/functions/typescript)!</br>
:heavy_check_mark: Local production testing with [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)</br>
:heavy_check_mark: [Multiple Hosting Sites](https://firebase.google.com/docs/hosting/multisites#add_additional_sites)</br>

</div>

## Contents

- [Setup](#setup)
  - [Beta Adapter Version Compatibility](#beta-adapter-version-compatibility)
- [Configuration Overview](#configuration-overview)
- [Details](#details)
  - [`firebase.json` Configurations](#firebasejson-configurations)
  - [Adapter Configurations](#adapter-configurations)
- [Cloud Function](#cloud-function)
  - [Firebase Emulator local Testing](#cloud-function-firebase-emulator-local-testing)
  - [Deployment](#cloud-function-deployment)
  - [Caveats](#cloud-function-caveats)
- [Cloud Run](#cloud-run)
  - [Local Testing](#cloud-run-local-testing)
  - [Deployment](#cloud-run-deployment)
  - [Caveats](#cloud-run-caveats)
- [Function vs Run](#function-vs-run)
- [Non-Goals](#non-goals)
- [FAQ](#faq)
- [Caveats](#caveats)
- [Hints with Codes](#hints-with-codes)
- [Contributing](#contributing)

## Setup

This adapter reads `firebase.json` to determine whether Cloud Functions or Cloud Run is being used and outputs the server pieces accordingly. Static assets are output to the configured dir in `firebase.json:hosting.public`.

In your standard SvelteKit project:

- `npm install --save-dev svelte-adapter-firebase`
- add adapter to `svelte.config.js` (see options in [Adapter Configurations](#adapter-configurations)):

```diff
+import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
+   adapter: firebase(),
    target: "#svelte",
  },
};
```

- in the SvelteKit project's `package.json` remove Firebase Hosting public directory before `svelte-kit build` to work around https://github.com/sveltejs/kit/issues/587

```diff
	"scripts": {
		"dev": "svelte-kit dev",
-		"build": "svelte-kit build --verbose"
+		"build": "npx rimraf <dir used in firebase.json:hosting.public> && svelte-kit build --verbose"
  }
```

- `npm run build`. **Read and repeat, the output is meant as a guide!**

<!-- TODO: on 1.0.0 release, delete this section -->

### Beta Adapter Version Compatibility

SvelteKit is still in Beta and the Adapter API is in flux, this can result in the Adapter and SvelteKit becoming incompatible. Here is a compatibility table:

| Adapter Version | SvelteKit Version |
| --------------- | ----------------- |
| WIP             | `1.0.0-next.152`  |
| `0.10.x`        | `1.0.0-next.132`  |
| `0.9.1`         | `1.0.0-next.122`  |
| `0.9.0`         | `1.0.0-next.120`  |
| `0.8.x`         | `1.0.0-next.111`  |
| `NA`            | `1.0.0-next.110`  |
| `NA`            | `1.0.0-next.109`  |
| `0.7.x`         | `1.0.0-next.107`  |
| `0.6.x`         | `1.0.0-next.103`  |
| `0.5.x`         | `1.0.0-next.54`   |
| `0.4.x`         | `1.0.0-next.46`   |
| `0.3.x`         | `1.0.0-next.27`   |

**Note**: only the versions listed have been tested together, if others happen to work, it is just coincidence. This is beta software after all.

<!-- END -->

## Configuration Overview

Adapter options:

- `hostingSite`
  - required when `firebase.json:hosting` is an array (contains many site configurations)
  - default: no default value
- `sourceRewriteMatch`
  - used to lookup the rewrite config to determine whether to output SSR code for Cloud Functions or Cloud Run. See [Firebase Rewrite configuration docs](https://firebase.google.com/docs/hosting/full-config#rewrite-functions).
  - default: `**`
- `firebaseJson`
  - path to your `firebase.json` file, relative from where `svelte build` is called
  - default: `./firebase.json`
- `cloudRunBuildDir`
  - output dir of Cloud Run service, relative from the `firebaseJson` location
  - default: `./.${run.serviceId}` where `run.serviceId` is pulled from the `firebase.json` rewrite rule

Adapter output:

- static assets (images, CSS, Client-side JavaScript) of your SvelteKit app output to the directory defined by `firebase.json:hosting.public`
- server assets (SSR JavaScript) output alongside your Cloud Functions defined by `firebase.json:functions.source` or the `cloudRunBuildDir` depending on which service you are targeting in `firebase.json:hosting:rewrites`

## Details

[Setup](#setup) outlines the steps most commonly used with a single SvelteKit app. Here we go into the details of each configuration and how it interacts with the `firebase.json` config.

The 3 step process is:

1. select Hosting config from `firebase.json`. If more than one site, match using `hostingSite`
2. output static assets to the directory in the `public` field
3. identify the rewrite rule for SSR to determine Cloud Function or Cloud Run output. The rewrite rule is determined by a lookup of the `rewrites.source` against `sourceRewriteMatch`

### `firebase.json` Configurations

Due to the relaxed rules of `firebase.json` we can have many valid configs. At a minimum, one or more Hosting sites is required with an associated Functions config if a Cloud Function rewrite is used. These are the combintations:

<details>
<summary>single Hosting site with Cloud Function rewrite</summary>

```json
{
  "hosting": {
    "public": "<someDir>",
    "rewrites": [
      {
        "source": "**",
        "function": "<functionName>"
      }
    ]
  },
  "functions": {
    "source": "<anotherDir>"
  }
}
```

</details>

<details>
<summary>multiple Hosting site with Cloud Function rewrite</summary>

```json
{
  "hosting": [
    {
      "site": "blog",
      "public": "<someDir>",
      "rewrites": [
        {
          "source": "**",
          "function": "<functionName>"
        }
      ]
    },
    {
      // another site config
    }
  ],
  "functions": {
    "source": "<anotherDir>"
  }
}
```

To correctly lookup the `blog` site, `hostingSite` will need to be set in `svelte.config.js`:

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ hostingSite: "blog" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary>single Hosting site with Cloud Run rewrite</summary>

```json
{
  "hosting": {
    "public": "<someDir>",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "<cloudRunServiceId>"
        }
      }
    ]
  }
}
```

</details>

<details>
<summary>multiple Hosting site with Cloud Run rewrite</summary>

```json
{
  "hosting": [
    {
      "site": "blog",
      "public": "<someDir>",
      "rewrites": [
        {
          "source": "**",
          "run": {
            "serviceId": "<cloudRunServiceId>"
          }
        }
      ]
    },
    {
      // another site config
    }
  ]
}
```

To correctly lookup the `blog` site, `hostingSite` will need to be set in `svelte.config.js`:

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ hostingSite: "blog" }),
    target: "#svelte",
  },
};
```

</details>

### Adapter Configurations

Detailed examples of the adapter configuration options.

All options:

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({
      hostingSite: "",
      sourceRewriteMatch: "",
      firebaseJson: "",
      cloudRunBuildDir: "",
      esbuildBuildOptions: (defaultOptions: BuildOptions) => Promise<BuildOptions> | BuildOptions,
    }),
    target: "#svelte",
  },
};
```

<details>
<summary><code>hostingSite</code></summary>

If `firebase.json:hosting` is an array of sites, then you must provide a `site` with `hostingSite` to correctly match against. For example:

```json
// firebase.json
{
  "hosting": [
    {
      "site": "blog",
      "public": "<someDir>",
      "rewrites": [
        {
          "source": "**",
          "run": {
            "serviceId": "<cloudRunServiceId>"
          }
        }
      ]
    },
    {
      "site": "adminPanel",
      "public": "<anotherDir>"
    }
  ]
}
```

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ hostingSite: "blog" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary><code>sourceRewriteMatch</code></summary>

If the rewrite `source` pattern is not `**`, then `svelte.config.js` `sourceRewriteMatch` will need to be set to match your desired rewrite rule. For example:

```json
// firebase.json
{
  "hosting": {
    "public": "<someDir>",
    "rewrites": [
      {
        "source": "/blog/**",
        "run": {
          "serviceId": "<cloudRunServiceId>"
        }
      }
    ]
  }
}
```

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ sourceRewriteMatch: "/blog/**" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary><code>firebaseJson</code></summary>

If the `firebase.json` file is not in the directory you run `svelte build`, then you can set a relative path in `svelte.config.js`:

```
.gitignore
firebase.json
app/                    <-- svelte build run in this dir
	package.json
	svelte.config.js
	src/
anotherApp/
	index.html
	index.css
functions/
	package.json
	index.js
```

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ firebaseJson: "../firebase.json" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary><code>cloudRunBuildDir</code></summary>

By default, a Node.js Cloud Run service is output to the directory named after the `run.serviceId` prefixed with a `.` relative to the dir in which `svelte build` was executed. IE: `./.${run.serviceId}`. So with this config:

```json
// firebase.json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "mySiteSSR"
        }
      }
    ]
  }
}
```

will result in this output:

```
.mySiteSSR/         <--- Cloud Run service code
public/             <--- Hosting static assets
firebase.json
package.json
svelte.config.js
src/
	app.html
	routes/
		index.svelte
functions/
	package.json
	index.js
```

If you wish to customise this output dir, then you can specify it in the adapter config:

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({ cloudRunBuildDir: ".special/ssr/output/dir" }),
    target: "#svelte",
  },
};
```

`cloudRunBuildDir` is relative from the `firebase.json` file loaded by `firebaseJson` option (which has default `./firebase.json`).

</details>

<details>
<summary><code>esbuildBuildOptions</code></summary>

As an escape hatch, you may optionally specify a function which will receive the final esbuild options generated by this adapter and returns a modified esbuild configuration. The result of this function will be passed as-is to esbuild. The function can be async.

For example, you may wish to add a plugin:

```js
import firebase from "svelte-adapter-firebase";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: firebase({
      esbuildBuildOptions(defaultOptions) {
        return {
          ...defaultOptions,
          plugins: []
        }
      }
    }),
    target: "#svelte",
  },
};
```

The default options for this version are as follows:

```js
{
	entryPoints: ['.svelte-kit/firebase/handler.js'],
	outfile: `pathToOutputDir/index.js`,
	bundle: true,
	inject: ['pathTo/shims.js'],
	platform: 'node'
}
```

</details>


## Cloud Function

With this `firebase.json` and `functions/` dir in a standard SvelteKit app structure and default `svelte-adapter-firebase` config:

```json
// firebase.json
{
  "hosting": {
    "public": "myApp",
    "rewrites": [
      {
        "source": "**",
        "function": "ssrServer"
      }
    ],
    "predeploy": ["npm run build"]
  },
  "functions": {
    "source": "functions"
  }
}
```

```
firebase.json ("public": "myApp")
package.json
svelte.config.js
src/
	app.html
	routes/
		index.svelte
functions/
	package.json ("main": "index.js")
	index.js
	sveltekit/		<-- Server assets
myApp/				<-- Static assets to go to Firebase Hosting CDN
```

The `firebase.json functions.source` dir is used to find `functions/package.json` whose `main` field is used to find the Cloud Function build dir. This is used as the server asset output dir.

<details>
<summary>TypeScript Cloud Functions</summary>

Because we use the above method to determine the output dir the server assets are output to the correct place when using TypeScript.

```
firebase.json ("public": "myApp")
package.json
svelte.config.js
src/
	app.html
	routes/
		index.svelte
functions/
	package.json ("main": "lib/index.js")
	index.ts
	lib/
		index.js
		sveltekit/	<-- Server assets output to functions/lib
myApp/				<-- Static assets to go to Firebase Hosting CDN
```

</details>

<details>
<summary>Output with Multiple Sites</summary>

In a multi-site setup, the `site` name from hosting config in `firebase.json` is used as the server output dir:

```
firebase.json ("site": "myCoolSite","public": "myApp")
package.json
svelte.config.js
src/
	app.html
	routes/
		index.svelte
functions/
	package.json
	index.js
	myCoolSite/		<-- Server assets
myApp/				<-- Static assets to go to Firebase Hosting CDN
```

</details>

The final piece is to write the actual Cloud Function source code to reference the output server assets. The code is printed during `svelte build` and should be placed in your `index.js` or `index.ts` manually.

This is a flexible solution that allows integrating with other Cloud Functions in your project. You can edit the provided code as you see fit. The import/require of the generated code will not change unless you change the `firebase.json:hosting.site` or `package.json:main` fields, so you shouldn't need to update this code after adding it.

### Cloud Function Firebase Emulator local Testing

Test your production build locally before pushing to git or deploying!

- build your app: `svelte-kit build`
- install Function dependencies: `pnpm install --prefix functions`
- start the emulator: `firebase emulators:start`

### Cloud Function Deployment

`firebase deploy` :tada:

## Cloud Run

With this `firebase.json` a standard SvelteKit app structure and default `svelte-adapter-firebase` config:

```json
// firebase.json
{
  "hosting": {
    "public": "<someDir>",
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "mySiteSSR"
        }
      }
    ]
  }
}
```

will result in this output:

```
.mySiteSSR/         <--- This contains the Cloud Run service code
firebase.json
package.json
svelte.config.js
src/
	app.html
	routes/
		index.svelte
functions/
	package.json
	index.js
```

See the [official Hosting/Cloud Run docs here](https://firebase.google.com/docs/hosting/cloud-run) for more setup information (enabling required APIs etc).

For those interested, we support Cloud Run with the same JS code as Cloud Functions, via the NodeJS [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) and reliance on the [Node.js 14 Buildpacks](https://github.com/GoogleCloudPlatform/buildpacks/tree/main/builders/gcf/nodejs14), which is what essentially powers Cloud Functions.

### Cloud Run Local Testing

Cloud Run cannot be tested locally with the Firebase Emulator. However, you can still build and run it locally with `gcloud` cli:

```shell
gcloud beta code dev --builder
```

This will build the container using the Google Node 14 buildpack image, run the image locally, and rebuild the image on code changes. For more details, see - https://cloud.google.com/run/docs/testing/local#cloud-sdk_

When you route to the hosted image you should be able to navigate your Cloud Run app but your CDN hosted resources (css, images, etc) will not load properly. This can be used as a sanity check

### Cloud Run Deployment

`gcloud` CLI is required to build & deploy Cloud Run services. The recommended build & deploy command for Cloud Run will be output when the adapter is run.

```shell
gcloud beta run deploy ${serviceId} --platform managed --region ${region} --source ${serverOutputDir} --allow-unauthenticated
```

Notably, this command **builds** and **deploys** your container, which is traditionally a two step process for container runtimes. You can orchestrate your deployment however you wish. Feel free to modify the command with any other Cloud Run features you may want to use, like increasing the `concurrency` or setting `min_instances`

This deploy command uses [Cloud Build](https://cloud.google.com/cloud-build) and the aforementioned [Buildpacks](https://cloud.google.com/blog/products/containers-kubernetes/google-cloud-now-supports-buildpacks) and [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs).

:warning: Each build of your app will require `firebase deploy --only hosting` alongside your Cloud Run deployment as your CDN content will need to be updated as the filename hashes of static resources is rewritten on each `svelte-kit build`

### Cloud Run Caveats

- testing of a Cloud Run service with Firebase Hosting CDN and other backend features (PubSub/Cloud Functions) will require a full deployment to a Firebase project. The suggestion is a `dev` project per engineer and manual deployments to each env to test. No environment per PR here.

## Function vs Run

Choice is a good thing, hopefully this comparison table helps you decide which compute environment is best for your application:

| Feature                                                           | Functions          | Run                                                                                                 |
| ----------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| Firebase Emulator Integration                                     | :heavy_check_mark: | :x:                                                                                                 |
| Unified deployment - Firebase Hosting & Compute deployed together | :heavy_check_mark: | :x:                                                                                                 |
| Cold start mitigations                                            | :x: (stay tuned)     | :heavy_check_mark: ([`min_instances`](https://cloud.google.com/run/docs/configuring/min-instances)) |
| Regions                                                           | :x: only ```us-central1``` shown in [docs](https://firebase.google.com/docs/hosting/functions) (stay tuned)     | :heavy_check_mark: full list in [docs](https://firebase.google.com/docs/hosting/full-config#rewrite-cloud-run-container) |

Cloud Functions seems do be a better default, with some improvements coming in the future.

## Non-goals

> Write Cloud Function code directly into `.js` file instead of printing in console.

Firebase Cloud Functions have a long history of people configuring their index files completely differently, some even generating them from directories. Accommodating these would be a headache. Instead, all we look for is a match against this string, `${name} =`, where `name` is your Cloud Functions name. We may make this configurable to a specific file in future.

Additionally, this allows for users to customise their Firebase Cloud Function API like `runWith()` options for memory/CPU and VPC/Ingress/Egress configuration settings, without complex support for options in the adapter. This keeps the Function config where it should, close to the executing code.

> Handle the deployment of the app to Firebase.

Firebase apps consist of many different services with the CLI providing optional deployments. We do not want to dictate full deployments with your frontend nor perform partial deployments if it does not fit your app. The only option then is to leave it to you :tada:

> Custom Docker images

We support Cloud Run with the same JS code as Cloud Functions, via the NodeJS [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) and reliance on the [Node14 Buildpacks](https://github.com/GoogleCloudPlatform/buildpacks/tree/main/builders/gcf/nodejs14), which is what essentially powers Cloud Functions. Diverging from this would make supporting Cloud Run more difficult. The idea behind the support is to allow usage of Cloud Run features, for example, [`min_instances`](https://cloud.google.com/run/docs/configuring/min-instances) and [concurrent requests](https://cloud.google.com/run/docs/about-concurrency) which both reduce cold starts (if that matters to you, use the CDN!)

We are open to discussion on this topic, but it was not a goal when setting out to build this adapter (consider the cost/benefit to implement this feature well).

## FAQ

> Why is the Cloud Function code output to the terminal for me to add manually instead of being written to `functions/index.js`?

See [non-goals](#non-goals) _Write Cloud Function code directly into `.js` file instead of printing in console._

> Firebase libs in SvelteKit

As recommended in the [SvelteKit FAQ](https://kit.svelte.dev/faq), please use [Firebase JS SDK v9](https://firebase.google.com/docs/web/learn-more#modular-version) as the older version of the SDK has issues and a larger bundle size.

> Cold Starts

Depends on your application load. Typically, Cloud Functions will require more instances to handle the same number of requests as each Cloud Run as each CR instance can handle up to 250 (default maximum at the time of writing). Though in my experience, bumping the memory/cpu configuration dramatically reduces the response times.

Since the purpose of using this adapter is to leverage the Firebase Hosting CDN, you should consider improving the user experience with targetted caching/TTLs.

If cold starts are still an issue for your application, Cloud Run has support for [`min_instances`](https://cloud.google.com/run/docs/configuring/min-instances) which will keep `x` number of instances warm. This incurs additional costs, though [as discussed by Ahmet Alp Balkan here](https://github.com/ahmetb/cloud-run-faq#how-to-keep-a-cloud-run-service-warm) can be cheaper than an equivalent Compute Engine instance. See the [official Cloud Run pricing documentation](https://cloud.google.com/run/pricing) for more.

## Caveats

- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/test-preview-deploy) currently lacks first-party support for SSR applications. This adapter doesn't attempt to remedy this issue and doesn't produce a different SSR Function/Run for preview channel deployments.
- :warning: Cloud Function rewrites only support **us-central1**, other regions will error. The official warning about this can be found in [these docs](https://firebase.google.com/docs/hosting/functions).
<!-- TODO: on 1.0.0 release, delete this section -->
- `1.0.0` will not be published until the SvelteKit Adapter API is declared stable and SvelteKit is released for general use.
<!-- END -->

## Hints with Codes

The adapter is intended to guide you through the configuration of your `firebase.json` and `svelte.config.js` file. As such, when you have a misconfiguration the adapter will log a hint. Codes for these hints are listed here:

**firebase.json file**

- SAF1000: provided `firebase.json` file does not exist. It is computed from adapter config `firebaseJson`. If the default adapter config is not working, consider updating it in `svelte.config.js`
- SAF1001: `JSON.parse` error of `firebase.json`

**firebase.json:hosting[]**

- SAF1010: `hosting` field required in `firebase.json`
- SAF1011: Multiple hosting configurations found, which requires each to have a `site` field, one does not.
- SAF1012: Multiple `hosting` configurations found in `firebase.json` but no `hostingSite` specified in `svelte.config.js` adapter config.
- SAF1013: Multiple `hosting` configurations found in `firebase.json` but no match found for `hostingSite` specified in `svelte.config.js` adapter config.

**firebase.json:hosting[].rewrites**

- SAF1020: Required `hosting[].rewrites` field not found for matched hosting config.
- SAF1021: Required `hosting[].rewrites[]` does not contain a config with `source` matching adapter config `sourceRewriteMatch` and either `function` or `run` entries.

**firebase.json:hosting[].rewrites Cloud Run config**

- SAF1030: Required `serviceId` field not found for Cloud Run rewrite rule in `firebase.json`.
- SAF1031: Cloud Run `serviceId` is invalid. Cloud Run `serviceId` must use only lowercase alphanumeric characters and dashes, cannot begin or end with a dash, and cannot be longer than 63 characters. Update `firebase.json` accordingly.
- SAF1032: Cloud Run `region` is invalid. Firebase Hosting rewrites only support `"regions":"us-central1"`. Update `firebase.json` accordingly.

**firebase.json:hosting[].rewrites Cloud Function config**

- SAF1040: Function name for rewrite rule is invalid. Function name must use only alphanumeric characters and underscores and cannot be longer than 62 characters. Update `firebase.json` accordingly.

**firebase.json:hosting[].public**

- SAF1050: Required `hosting.public` field not found for hosting configuration. Add a `public` field to the matched hosting config in `firebase.json`.
- SAF1051: `firebase.json:hosting.public` must be a different directory to `svelte.config.js:kit.files.assets`.
- SAF1052: Required "hosting.public" field is an empty string. "public" should be a directory name.

**firebase.json:functions**

- SAF1060: Required `functions.source` field missing from `firebase.json` file.
- SAF1061: Node.js runtime not supported. SvelteKit on Cloud Functions requires Node.js 14 or newer runtime. Set the version in either: `<cloud function dir>/package.json:engines.node` or `firebase.json:functions.runtime`.

## Contributing

[Contributions of any kind welcome, just follow the guidelines](CONTRIBUTING.md)!

Short version:

```
git clone https://github.com/jthegedus/svelte-adapter-firebase.git
asdf install
pnpm i
```

See [asdf](https://asdf-vm.com) to install set it up.

### external contributions

While building this adapter some issues were found with upstream components, these are captured here should someone wish to contribute them:

- Cloud Function validation code linked in `utils.js` is from two different sources which indicates that it is being validated by `firebase-tools` in two separate places. PR a fix there.
