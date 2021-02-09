# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
