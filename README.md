# npm-upgrade-monorepo

Apply [npm-upgrade](https://github.com/th0r/npm-upgrade) to monorepos. The wrapper just parses `workspaces` field of package.json, and invokes **npm-upgrade** for each internal package dir. 

[![CI](https://github.com/antongolub/npm-upgrade-monorepo/workflows/CI/badge.svg)](https://github.com/antongolub/npm-upgrade-monorepo/actions)
[![David](https://img.shields.io/david/dev/antongolub/npm-upgrade-monorepo?label=deps)](https://david-dm.org/antongolub/npm-upgrade-monorepo)
[![Maintainability](https://api.codeclimate.com/v1/badges/ba54d6fecd9b4d088387/maintainability)](https://codeclimate.com/github/antongolub/npm-upgrade-monorepo/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ba54d6fecd9b4d088387/test_coverage)](https://codeclimate.com/github/antongolub/npm-upgrade-monorepo/test_coverage)
[![npm (tag)](https://img.shields.io/npm/v/npm-upgrade-monorepo)](https://www.npmjs.com/package/npm-upgrade-monorepo)

## Install
```shell
npm i -g npm-upgrage-monorepo
```

## Usage
API inherits `npm-upgrade` [CLI contract](https://github.com/th0r/npm-upgrade#usage). 
```shell
npm-upgrage-monorepo [...args]
```

### --workspaces / -w
Additional param lets to override `package.json` `workspaces` field value.
```shell
npm-upgrage-monorepo -w packages/*
npm-upgrage-monorepo -w scope1/a,scope2/b
```

## Alternatives
* `yarn upgrade-interactive`
* [Anifacted/lerna-update-wizard](https://github.com/Anifacted/lerna-update-wizard)
* [codsen/update-versions](https://github.com/codsen/codsen/tree/main/packages/update-versions)
* Bash script
```shell
#!/bin/bash

NPM_UPGRADE="npm-upgrade"
PACKAGES=$(cat package.json | jq -r '.workspaces | join(" ")')

eval $NPM_UPGRADE

for f in $PACKAGES; do
  if [ -d "$f" ]; then
    cd $f
    eval $NPM_UPGRADE
  fi
done
```
## License
[MIT](./LICENSE)
