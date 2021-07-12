# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/nuxt-contrib/devalue/compare/v2.0.0-0...v2.0.0) (2021-07-12)

## [2.0.0-0](https://github.com/nuxt-contrib/devalue/compare/v1.2.4...v2.0.0-0) (2021-05-17)


### ⚠ BREAKING CHANGES

* no longer support `NUXT_ENV_DEVALUE_LOG_LIMIT` and `NUXT_ENV_DEVALUE_LOG_LEVEL` environment variables

allow universal usage without depending on external package

### Features

* remove dependency on consola ([c010205](https://github.com/nuxt-contrib/devalue/commit/c0102058d43ec6a07be3a23a4019734bd70399ee))
* use siroc build ([c096a2d](https://github.com/nuxt-contrib/devalue/commit/c096a2d721f1053220d694e01b783c1e48527f00))


### Bug Fixes

* avoid depending on node `process` ([#16](https://github.com/nuxt-contrib/devalue/issues/16)) ([a3231b0](https://github.com/nuxt-contrib/devalue/commit/a3231b0e5c5f089464059ed03d9264a2440a07d2))
* avoid duplicate parameter names ([#12](https://github.com/nuxt-contrib/devalue/issues/12)) ([1880d0b](https://github.com/nuxt-contrib/devalue/commit/1880d0bc70387923c2876f3e1c60eaff9a0115f4))

## 1.1.0

* Escape lone surrogates ([#13](https://github.com/Rich-Harris/devalue/issues/13))

## 1.0.4

* Smaller output ([#10](https://github.com/Rich-Harris/devalue/pull/10))

## 1.0.3

* Detect POJOs cross-realm ([#7](https://github.com/Rich-Harris/devalue/pull/7))
* Error on symbolic keys ([#7](https://github.com/Rich-Harris/devalue/pull/7))

## 1.0.2

* Fix global name for UMD build

## 1.0.1

* XSS mitigation ([#1](https://github.com/Rich-Harris/devalue/issues/1))

## 1.0.0

* First release