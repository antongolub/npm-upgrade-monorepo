# npm-upgrade-monorepo
Apply [npm-upgrade](https://github.com/th0r/npm-upgrade) to monorepos. The wrapper just parses `workspaces` field of package.json, and invokes **npm-upgrade** for each internal package dir. 

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
Additional param lets to override `package.json` `workspace` field value.

## Alternatives
* `yarn upgrade-interactive`
* [Anifacted/lerna-update-wizard](https://github.com/Anifacted/lerna-update-wizard)
* [codsen/update-versions](https://github.com/codsen/codsen/tree/main/packages/update-versions)

## License
[MIT](./LICENSE)
