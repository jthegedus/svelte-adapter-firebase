# [0.7.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.5...v0.7.0) (2021-05-12)


### Features

* sync new SvelteKit & init test suite ([#52](https://github.com/jthegedus/svelte-adapter-firebase/issues/52)) ([a1cb743](https://github.com/jthegedus/svelte-adapter-firebase/commit/a1cb743e835b6782344437026b0a4c238bb39842))

## [0.6.5](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.4...v0.6.5) (2021-05-10)


### Bug Fixes

* resolve dirname of firebaseJsonDir ([#49](https://github.com/jthegedus/svelte-adapter-firebase/issues/49)) ([7556c7d](https://github.com/jthegedus/svelte-adapter-firebase/commit/7556c7d21f52488f500498a7bbf79f82771f51b2))

## [0.6.4](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.3...v0.6.4) (2021-05-10)


### Bug Fixes

* export firebaseJsonDir from config parser func ([#48](https://github.com/jthegedus/svelte-adapter-firebase/issues/48)) ([5ec2e18](https://github.com/jthegedus/svelte-adapter-firebase/commit/5ec2e184669a036941e5ad48477b93aa67ffbf85))

## [0.6.3](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.2...v0.6.3) (2021-05-07)


### Bug Fixes

* allow any node package manager to install ([#46](https://github.com/jthegedus/svelte-adapter-firebase/issues/46)) ([417f167](https://github.com/jthegedus/svelte-adapter-firebase/commit/417f1673fd3561d3cd80d9a23944407a8485fd7f))

## [0.6.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.1...v0.6.2) (2021-05-07)


### Bug Fixes

* treat `firebase.json` as root dir for Firebase resources ([#43](https://github.com/jthegedus/svelte-adapter-firebase/issues/43)) ([82c8493](https://github.com/jthegedus/svelte-adapter-firebase/commit/82c8493403199b82645eed8138fe04e79a108453))

## [0.6.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.6.0...v0.6.1) (2021-05-06)


### Bug Fixes

* handle empty deps when cloud run target ([#41](https://github.com/jthegedus/svelte-adapter-firebase/issues/41)) ([b7719bd](https://github.com/jthegedus/svelte-adapter-firebase/commit/b7719bd486de71ceccdc57c5703de49cdb3f9f77))

# [0.6.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.5.2...v0.6.0) (2021-05-06)


### Bug Fixes

* remove unused pnpm run build cmd from workflow ([#40](https://github.com/jthegedus/svelte-adapter-firebase/issues/40)) ([e7ab34a](https://github.com/jthegedus/svelte-adapter-firebase/commit/e7ab34a2ac3da094f006e76e2b327cfe0463d547))


### Features

* update to kit@next.100, convert to esm ([#39](https://github.com/jthegedus/svelte-adapter-firebase/issues/39)) ([d2f95a1](https://github.com/jthegedus/svelte-adapter-firebase/commit/d2f95a1132abee67b41dce5a9419f132ea3164ce))

## [0.5.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.5.1...v0.5.2) (2021-04-28)


### Bug Fixes

* use searchParams in handler.js ([#35](https://github.com/jthegedus/svelte-adapter-firebase/issues/35)) ([b2911a0](https://github.com/jthegedus/svelte-adapter-firebase/commit/b2911a0e713f7da0371ebb8791dbbefb9875096b))

## [0.5.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.5.0...v0.5.1) (2021-03-22)


### Bug Fixes

* align adapter API with SvelteKit v1.0.0-next.54 ([#23](https://github.com/jthegedus/svelte-adapter-firebase/issues/23)) ([abe68f1](https://github.com/jthegedus/svelte-adapter-firebase/commit/abe68f19a293758574893984ebbb0c36b0a448ae))

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
