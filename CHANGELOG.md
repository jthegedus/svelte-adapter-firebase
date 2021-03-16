# [0.5.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.4.1...v0.5.0) (2021-03-16)


### Features

* cloud function support ([#21](https://github.com/jthegedus/svelte-adapter-firebase/issues/21)) ([2437374](https://github.com/jthegedus/svelte-adapter-firebase/commit/2437374b5b3517f6183e5d7ad8b5f5fe448ed61f))

## [0.4.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.4.0...v0.4.1) (2021-03-15)


### Bug Fixes

* dir structure and rollup cli entrypoint ([#19](https://github.com/jthegedus/svelte-adapter-firebase/issues/19)) ([fd0c5f2](https://github.com/jthegedus/svelte-adapter-firebase/commit/fd0c5f2712445edf4f9aa91820b53098bd1cab88))

# [0.4.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.3.3...v0.4.0) (2021-03-15)


### Features

* SvelteKit CR update with better Firebase config parsing ([#18](https://github.com/jthegedus/svelte-adapter-firebase/issues/18)) ([42ddb0c](https://github.com/jthegedus/svelte-adapter-firebase/commit/42ddb0c5f5da6472c6a74786a14b1730ceefec58))

## [0.3.3](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.3.2...v0.3.3) (2021-03-04)


### Bug Fixes

* inline svelte-app-utils lib ([#15](https://github.com/jthegedus/svelte-adapter-firebase/issues/15)) ([6f79964](https://github.com/jthegedus/svelte-adapter-firebase/commit/6f79964715cda538a72f9a12f50a8584953db8d1))

# Changelog

All notable changes to this project will be documented in this file.

### [0.3.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.3.1...v0.3.2) (2021-02-09)


### Bug Fixes

* destructure of adapter config error ([#11](https://github.com/jthegedus/svelte-adapter-firebase/issues/11)) ([6ece557](https://github.com/jthegedus/svelte-adapter-firebase/commit/6ece5578129ff9178030b561850eacc5cf9af286))

### [0.3.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.3.0...v0.3.1) (2021-02-08)


### Bug Fixes

* elevate logs to .warn & check CFs for `@sveltejs/kit` dep ([#9](https://github.com/jthegedus/svelte-adapter-firebase/issues/9)) ([6b35ee1](https://github.com/jthegedus/svelte-adapter-firebase/commit/6b35ee1a711a979fedaf7f97fc8f513974599698))

## 0.3.0 (2021-02-07)

- fix: cjs output from sveltekit requires rename of local require in handler.js
- fix: destructure of undefined in index.js.adapter(). Fixes #5

## 0.2.0 (2021-01-06)

- chore: build with microbundle instead of Rollup directly
- chore: format & lint with xojs instead of rome.tools
- chore: Joi as dependency and not inlined

## 0.1.0 (2021-01-05)

:tada: Initial Release

- feat: Cloud Functions for Firebase target
- feat: Cloud Run target
- feat: Integrates with existing `functions`
- feat: Supports Firebase configurations with multiple sites
