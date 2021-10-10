# Changelog


### [0.13.1](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.13.0...v0.13.1) (2021-10-10)


### Bug Fixes

* missed rename of hostingSite to target, bump kit for types ([#149](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/149)) ([cebf821](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/cebf8210c22291967b8ee2cbf3511736ddfbaef1))

## [0.13.0](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.12.0...v0.13.0) (2021-09-19)


### Features

* fb deploy targets. Rename opt `hostingSite` to `target` ([#144](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/144)) ([2ffe777](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/2ffe7774d41de9d4f88dc7d7935e5397e5999b44))


### Bug Fixes

* e2e tests with latest emulator ([#140](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/140)) ([5227bb5](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/5227bb5ced4576b530d0b9e6c38f91920e9863fe))
* pass null if no req.rawBody ([#143](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/143)) ([15c9ca4](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/15c9ca4bbd6783ab43614cb6b49692e4685372b8))

## [0.12.0](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.11.2...v0.12.0) (2021-09-16)


### Features

* compute esbuild target from Function runtime version ([#137](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/137)) ([61f2b3b](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/61f2b3bbc4c3c008a48b38890e4424956f06f9d9))
* deprecate Cloud Run support ([#135](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/135)) ([ee5d92a](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/ee5d92a2cf19508959846ef9090f679773d299de))
* rename adapter config `firebaseJson` to `firebaseJsonPath` ([#135](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/135)) ([ee5d92a](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/ee5d92a2cf19508959846ef9090f679773d299de))

### Bug Fixes

* output entrypoint code without verbose mode ([#138](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/138)) ([305ae73](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/305ae73197dc943dfe05734487ba43fd72e5a11b))

### [0.11.2](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.11.1...v0.11.2) (2021-09-10)


### Bug Fixes

* export package.json from package ([#132](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/132)) ([62e29f6](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/62e29f6b8a646cfb9537ed94f60cf040c843ed6e))

### [0.11.1](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.11.0...v0.11.1) (2021-09-08)


### Bug Fixes

* support nodejs16 env ([#129](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/129)) ([3645519](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/36455197594c49bed10b286a3fd7f35a0eb951f1))

## [0.11.0](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.10.5...v0.11.0) (2021-08-23)


### Features

* new rawBody type on SvelteKit req ([#123](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/123)) ([fec3174](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/fec31742415274110a1b068915cd166029dec6ad))

### [0.10.5](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.10.4...v0.10.5) (2021-07-21)


### Bug Fixes

* document potential Cloud Run deprecation ([#119](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/119)) ([ac8cd74](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/ac8cd745632f4d0f63d116dd6ea0aedf4d7178ab))

### [0.10.4](https://www.github.com/jthegedus/svelte-adapter-firebase/compare/v0.10.3...v0.10.4) (2021-07-21)


### Features

* support esbuild config ([#109](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/109)) ([3b7c733](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/3b7c733249b6f29e4041e56bbc9c8dabd24c9c86))

### Bug Fixes

* update sveltekit peer dep ([#112](https://www.github.com/jthegedus/svelte-adapter-firebase/issues/112)) ([d6aea82](https://www.github.com/jthegedus/svelte-adapter-firebase/commit/d6aea8293b04d6e529daed24d420656317315aed))


## [0.9.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.9.1...v0.9.2) (2021-07-09)


### Bug Fixes

* beta version compat table ([114a30f](https://github.com/jthegedus/svelte-adapter-firebase/commit/114a30f0e95bf34b5ecc58457bc920d8e15410aa))

## [0.9.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.9.0...v0.9.1) (2021-07-07)


### Bug Fixes

* use esbuild inject api to ensure exec order & polyfill ([#104](https://github.com/jthegedus/svelte-adapter-firebase/issues/104)) ([52429d2](https://github.com/jthegedus/svelte-adapter-firebase/commit/52429d23809c08dd8027e6b0ce8c2e04b6b41136))

# [0.9.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.5...v0.9.0) (2021-07-04)


### Features

* adapter runs app init ([#103](https://github.com/jthegedus/svelte-adapter-firebase/issues/103)) ([9d281fb](https://github.com/jthegedus/svelte-adapter-firebase/commit/9d281fb0dfc9b41146232768850b67fa1b866e84))

## [0.8.5](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.4...v0.8.5) (2021-06-25)


### Bug Fixes

* valid cloud run region ([#102](https://github.com/jthegedus/svelte-adapter-firebase/issues/102)) ([58d8d3d](https://github.com/jthegedus/svelte-adapter-firebase/commit/58d8d3dfec5ac9d644df63fd00e497ac21544a91))

## [0.8.4](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.3...v0.8.4) (2021-05-30)


### Bug Fixes

* specify minimum nodejs version in package.json ([#98](https://github.com/jthegedus/svelte-adapter-firebase/issues/98)) ([456da34](https://github.com/jthegedus/svelte-adapter-firebase/commit/456da349d359470002dadb841acce5cbb0b8589a))

## [0.8.3](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.2...v0.8.3) (2021-05-30)


### Bug Fixes

* use SK computed config to determine if static dirs differ ([#97](https://github.com/jthegedus/svelte-adapter-firebase/issues/97)) ([53e3c97](https://github.com/jthegedus/svelte-adapter-firebase/commit/53e3c97d321fa8a29dfa44059927291893d4ee2a))

## [0.8.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.1...v0.8.2) (2021-05-30)


### Bug Fixes

* simplify body parsing & add handler types ([#96](https://github.com/jthegedus/svelte-adapter-firebase/issues/96)) ([8b47baf](https://github.com/jthegedus/svelte-adapter-firebase/commit/8b47baf262dcf409db83eaeb1fd84280b18c663f))

## [0.8.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.8.0...v0.8.1) (2021-05-30)


### Bug Fixes

* wait request body infinitely in handler.js ([#93](https://github.com/jthegedus/svelte-adapter-firebase/issues/93)) ([94c4158](https://github.com/jthegedus/svelte-adapter-firebase/commit/94c4158ee0fd11194e300f0e2b81b66f16b3a15d))

# [0.8.0](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.8...v0.8.0) (2021-05-30)


### Features

* update adapter api to latest with config ([#95](https://github.com/jthegedus/svelte-adapter-firebase/issues/95)) ([622739f](https://github.com/jthegedus/svelte-adapter-firebase/commit/622739fea6628c80e09453944171f690c0c41dc7))

## [0.7.8](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.7...v0.7.8) (2021-05-28)


### Bug Fixes

* improve tests & document tip codes ([#85](https://github.com/jthegedus/svelte-adapter-firebase/issues/85)) ([8f33de7](https://github.com/jthegedus/svelte-adapter-firebase/commit/8f33de7e3e542272ddba2cbc85903ab4ae02492f))

## [0.7.7](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.6...v0.7.7) (2021-05-17)


### Bug Fixes

* improve guide & logging of adapter ([#80](https://github.com/jthegedus/svelte-adapter-firebase/issues/80)) ([e60f5e2](https://github.com/jthegedus/svelte-adapter-firebase/commit/e60f5e2241f4c590267d2a1da0e474e8aa214650))

## [0.7.6](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.5...v0.7.6) (2021-05-16)


### Bug Fixes

* import of svelte.config.js requires string ([#74](https://github.com/jthegedus/svelte-adapter-firebase/issues/74)) ([3376a22](https://github.com/jthegedus/svelte-adapter-firebase/commit/3376a2250e64f79443a47787b206a8eb4485afe2))

## [0.7.5](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.4...v0.7.5) (2021-05-16)


### Bug Fixes

* import call for svelte.config.js on windows ([#76](https://github.com/jthegedus/svelte-adapter-firebase/issues/76)) ([02992ce](https://github.com/jthegedus/svelte-adapter-firebase/commit/02992cebfaa7681200a1773d00f87b4e3be00583))

## [0.7.4](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.3...v0.7.4) (2021-05-13)


### Bug Fixes

* instruct firebase deployment alongside Cloud Run ([#67](https://github.com/jthegedus/svelte-adapter-firebase/issues/67)) ([d1a1797](https://github.com/jthegedus/svelte-adapter-firebase/commit/d1a17977085f97fa20f25e5fc7e583ac1ec66b93))

## [0.7.3](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.2...v0.7.3) (2021-05-13)


### Bug Fixes

* ensure valid cloud function runtime version ([#66](https://github.com/jthegedus/svelte-adapter-firebase/issues/66)) ([46fafad](https://github.com/jthegedus/svelte-adapter-firebase/commit/46fafadb6ccfe0c39f0eeb3ee43bdebb4c13235c))

## [0.7.2](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.1...v0.7.2) (2021-05-13)


### Bug Fixes

* static output dir differes from static source dirs ([#65](https://github.com/jthegedus/svelte-adapter-firebase/issues/65)) ([72c7670](https://github.com/jthegedus/svelte-adapter-firebase/commit/72c7670e0c035d6c84f0361b5d39b3082a67958a))

## [0.7.1](https://github.com/jthegedus/svelte-adapter-firebase/compare/v0.7.0...v0.7.1) (2021-05-13)


### Bug Fixes

* github release assets ([#63](https://github.com/jthegedus/svelte-adapter-firebase/issues/63)) ([cd1a5e0](https://github.com/jthegedus/svelte-adapter-firebase/commit/cd1a5e04d19aed5aaf57c0303418eeb11dc30981))

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
