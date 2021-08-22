# Contribution Guidelines

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## How to contribute

- Open a [GitHub Issue](https://github.com/jthegedus/svelte-adatper-firebase/issues) for a discussion of your idea before working on it
- Fork this repo, develop your solution and submit a PR

Tooling:

- [`asdf`](https://asdf-vm.com/) is used to manage the dev environment and system-level tools
  - if you do not use `asdf`, then please see `.tool-versions` file for the specific versions of tools.
- `nodejs` dependencies then define the dev tools for this specific package
  - prefer [`pnpm`](https://pnpm.js.org/motivation) over `npm`

Setup:

```
git clone https://github.com/jthegedus/svelte-adapter-firebase.git
asdf install
pnpm i
```

## What to contribute

See the [GitHub Issues](https://github.com/jthegedus/svelte-adatper-firebase/issues) list for any open Issue, especially those marked as `help wanted`

General improvements to any aspect of this adapter are welcome, just ensure major work is preceeded by a conversation in a [GitHub Issue](https://github.com/jthegedus/svelte-adatper-firebase/issues).

## Tests

As an integration point between [SvelteKit](https://kit.svelte.dev) and Firebase Hosting with Function rewrites the tests for this package are **important**.

The test suite is broken into three categories:

- **unit**: test internal functions to the CLI & entrypoint JS code
- **integration**: runs the `build` command of SvelteKit with demo apps that tests each path of the src/index.js CLI entrypoint.
- **end-to-end**: runs a shell script which:
  - creates the SvelteKit Todo skeleton app (via `npm init@svelte <dir>`)
  - adds Firebase configuration for Hosting & Cloud Functions
  - adds `svelte-adapter-firebase` (relative add of the repo root, not from `npmjs.com`, to test current code changes before publishing)
  - creates the Cloud Function which hosts the compiled SvelteKit app (this is the code in `functions/index.js` that the CLI would prompt the user to add)
  - installs all dependencies for the Todo app & Cloud Functions
  - builds the app
  - starts the Firebase Emulator with Hosting & Functions
  - makes `curl` requests to the Todo app
    - GET to `/`
    - GET to `/about`
    - GET to `/todos`
    - POST with formdata to `/todos`

- Unit tests are run pre-push. They can be run manually with `pnpm run test`
- Integration tests are run in CI.
- End-to-end tests are run in CI. This script can be run locally with `./tests/end-to-end/test.bash`

All test suites are run in CI pipelines on PR creation.
