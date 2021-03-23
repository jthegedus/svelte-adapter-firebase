<div align="center">

| :warning: WARNING: this project is considered to be in ALPHA until SvelteKit is available for general use and the Adapter API is stable! |
| ---------------------------------------------------------------------------------------------------------------------------------------- |

![SvelteKit adapter Firebase social preview](assets/github-preview-svelte-adapter-firebase.png)

# svelte-adapter-firebase

[![GitHub Release](https://img.shields.io/github/release/jthegedus/svelte-adapter-firebase.svg?color=green)](https://github.com/jthegedus/svelte-adapter-firebase/releases) [![npm](https://img.shields.io/npm/v/svelte-adapter-firebase?color=green)](https://www.npmjs.com/package/svelte-adapter-firebase) [![Test](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/test.yaml/badge.svg)](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/test.yaml) [![CodeQL](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/jthegedus/svelte-adapter-firebase/actions/workflows/codeql-analysis.yml)

[Firebase](https://firebase.google.com/) adapter for [SvelteKit](https://github.com/sveltejs/kit). Supports:

:heavy_check_mark: SSR on [Cloud Run](https://firebase.google.com/docs/hosting/cloud-run)</br>
:heavy_check_mark: [Multiple Hosting Sites](https://firebase.google.com/docs/hosting/multisites#add_additional_sites)</br>
:heavy_check_mark: SSR on [Cloud Functions](https://firebase.google.com/docs/hosting/functions)</br>
:heavy_check_mark: Integrates with existing [JavaScript ~or TypeScript~ Cloud Functions](https://firebase.google.com/docs/functions/typescript)!</br>
:heavy_check_mark: Local production testing with [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)</br>

</div>

## Contents

- [Quickstart](#quickstart)
- [Configuration Overview](#configuration-overview)
- [Details](#details)
  - [`firebase.json` Configurations](#firebasejson-configurations)
  - [Adapter Configurations](#adapter-configurations)
- [Cloud Function](#cloud-function)
  - [Deployment](#cloud-function-deployment)
  - [Firebase Emulator local Testing](#cloud-function-firebase-emulator-local-testing)
  - [Caveats](#cloud-function-caveats)
- [Cloud Run](#cloud-run)
  - [Deployment](#cloud-run-deployment)
  - [Local Testing](#cloud-run-local-testing)
  - [Caveats](#cloud-run-caveats)
- [Function vs Run](#function-vs-run)
- [Non-Goals](#non-goals)
- [FAQ](#faq)
- [Caveats](#caveats)
- [Contributing](#contributing)

## Quickstart

In your standard SvelteKit project:

- `npm i -D svelte-adapter-firebase`
- add adapter to `svelte.config.cjs`:

  ```js
  const firebaseAdapter = require("svelte-adapter-firebase");

  /** @type {import('@sveltejs/kit').Config} */
  module.exports = {
    kit: {
      adapter: firebaseAdapter(),
      target: "#svelte",
    },
  };
  ```

- `npm run build`
- Follow further instructions output by the adapter to prepare for deployment.

This adapter reads your `firebase.json` to determine if the Firebase Hosting site is using Cloud Functions or Cloud Run and outputs the server pieces accordingly. Static assets are output to the `public` directory for the Hosting site config.

Please read the docs carefully!

## Configuration Overview

Adapter options:

- `hostingSite`
  - required when `firebase.json.hosting` is an array (contains many site configurations)
  - default: no default value
- `sourceRewriteMatch`
  - used to lookup the rewrite rule used for SSR
  - default: `**`
- `firebaseJson`
  - path to your `firebase.json`, relative from where `svelte build` is called
  - default: `./firebase.json`
- `cloudRunBuildDir`
  - output dir of Cloud Run service, relative from your svelte app
  - default: `./.${run.serviceId}` where `run.serviceId` is pulled from the `firebase.json` rewrite rule

## Details

[Quickstart](#quickstart) outlines the steps most commonly used with a single SvelteKit app. Here we go into the details of each configuration and how it interacts with the `firebase.json` config.

The 3 step process is:

1. select Hosting config from `firebase.json`. If more than one site match against `hostingSite`
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

To correctly lookup the `blog` site, `hostingSite` will need to be set in `svelte.config.cjs`:

```js
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ hostingSite: "blog" }),
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

To correctly lookup the `blog` site, `hostingSite` will need to be set in `svelte.config.cjs`:

```js
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ hostingSite: "blog" }),
    target: "#svelte",
  },
};
```

</details>

### Adapter Configurations

Detailed examples of the adapter configuration options.

<details>
<summary><code>hostingSite</code></summary>

If the firebase.json.hosting is an array of sites, then you must provide a `site` with `hostingSite` to correctly match against. For example:

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
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ hostingSite: "blog" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary><code>sourceRewriteMatch</code></summary>

If the rewrite `source` pattern is not `**`, then `svelte.config.cjs` `sourceRewriteMatch` will need to be set to match your desired rewrite rule. For example:

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
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ sourceRewriteMatch: "/blog/**" }),
    target: "#svelte",
  },
};
```

</details>

<details>
<summary><code>firebaseJson</code></summary>

If the `firebase.json` file is not in the directory you run `svelte build`, then you can set a relative path in `svelte.config.cjs`:

```
.gitignore
firebase.json
app/                    <-- svelte build run in this dir
	package.json
	svelte.config.cjs
	src/
anotherApp/
	index.html
	index.css
functions/
	package.json
	index.js
```

```js
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ firebaseJson: "../firebase.json" }),
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
svelte.config.cjs
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
const firebaseAdapter = require("svelte-adapter-firebase");

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  kit: {
    adapter: firebaseAdapter({ cloudRunBuildDir: ".special/ssr/output/dir" }),
    target: "#svelte",
  },
};
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
svelte.config.cjs
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
svelte.config.cjs
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
svelte.config.cjs
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

This is a flexible solution that allows integrating with other Cloud Functions in your project. You can edit the provided code as you see fit. The import/require of the generated code will not change unless you change the `firebase.json.hosting.site` or `package.json.main` fields, so you shouldn't need to update this code after adding it.

Additionally, the current SvelteKit server output requires the dep `@sveltejs/app-utils`, so ensure to add this to your Cloud Functions as well.

### Cloud Function Deployment

TODO

### Cloud Function Caveats

```
firebase.json ("site": "myCoolSite","public": "myApp")
package.json
svelte.config.cjs
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

As `package.json` gains dependencies for your Svelte app you may need to copy some of these to `functions/package.json` depending on the server-side functionality and how SvelteKit bundles your dependencies.

This is a core reason for recommending Cloud Run for SSR as it's built & deployed separately from the rest of your Cloud Functions. This isolation enables dependency syncing etc.

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
svelte.config.cjs
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

:warning: Each build of your app will require both `firebase deploy --only hosting` alongside your Cloud Run deployment

### Cloud Run Caveats

- testing of a Cloud Run service with Firebase Hosting CDN and other backend features (PubSub/Cloud Functions) will require a full deployment to a Firebase project. The suggestion is a `dev` project per engineer and manual deployments to each env to test. No environment per PR here.

## Function vs Run

TODO

## Non-goals

> Write Cloud Function code directly into `.js` file instead of printing in console.

Firebase Cloud Functions have a long history of people configuring their index files completely differently, some even generating them from directories. Accommodating these would be a headache. Instead, all we look for is a match against this string, `${name} =`, where `name` is your Cloud Functions name. We may make this configurable to a specific file in future.

Additionally, this allows for users to customise their Firebase Cloud Function API like `runWith()` options for memory/CPU and VPC/Ingress/Egress configuration settings, without complex support for options in the adapter. This keeps the Function config where it should, close to the executing code.

> Handle the deployment of the app to Firebase.

Firebase apps consist of many different services with the CLI providing optional deployments. We do not want to dictate full deployments with your frontend nor perform partial deployments if it does not fit your app. The only option then is to leave it to you :tada:

> Custom Docker images

We support Cloud Run with the same JS code as Cloud Functions, via the NodeJS [Functions Framework](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) and reliance on the [Node14 Buildpacks](https://github.com/GoogleCloudPlatform/buildpacks/tree/main/builders/gcf/nodejs14), which is what essentially powers Cloud Functions. Diverging from this would make supporting Cloud Run more difficult. The idea behind the support is to allow usage of Cloud Run features, for example, [`min_instances`](https://cloud.google.com/run/docs/configuring/min-instances) and [concurrent requests](https://cloud.google.com/run/docs/about-concurrency) which both reduce cold starts (if that matters to you, use the CDN!)

We are open to discussion on this topic, but it was not a goal when setting out to build this adapter (consider the cost/benefit).

## FAQ

> Why is the Cloud Function code output to the terminal for me to add manually instead of being written to `functions/index.js`?

See [non-goals](#non-goals) _Write Cloud Function code directly into `.js` file instead of printing in console._

> Firebase libs in SvelteKit routes

This adapter does not try to solve the issue of using Firebase libraries in SvelteKit routes. These routes are compiled by the SvelteKit pipeline and there are many issues as ESM support in Firebase libs is not released and won't be for a long time.

Using Firebase libs in SvelteKit `endpoints`/`routes` may have been resolved with https://github.com/sveltejs/kit/pull/490, however this does not mean the output is compatible with the Cloud Function runtime (investigation pending) and therefore compatible with `svelte-adapter-firebase`. Our recommendation is to prefer using Firebase Cloud Functions for API routes over SvelteKit routes.

## Caveats

- [Firebase Hosting Preview Channels](https://firebase.google.com/docs/hosting/test-preview-deploy) currently lacks first-party support for SSR applications. This adapter doesn't attempt to remedy this issue and doesn't produce a different SSR Function/Run for preview channel deployments.
- :warning: while you can specify the region for both, Cloud Run in `firebase.json` and Cloud Functions in `runWith({})` config, **`us-central1` is the only valid region for Firebase Hosting rewrites**, other regions will error. The official warning about this can be found in [these docs](https://firebase.google.com/docs/hosting/functions).
- `1.0.0` will not be published until the SvelteKit Adapter API is declared stable and SvelteKit is released for general use.

## Contributing

[Contributions of any kind welcome, just follow the guidelines](CONTRIBUTING.md)!

Short version:

```
git clone https://github.com/jthegedus/svelte-adapter-firebase.git
asdf install
pnpm i
```

### external contributions

- Cloud Function validation code linked in `utils.js` is from two different sources which indicates that it is being validated by `firebase-tools` in two separate places. PR a fix there.
