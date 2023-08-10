# ts-migration-helper

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Migrate simple Cheminfo JS projects to Typescript made for personal use.

## Installation

```bash
npx ts-migration-helper
```

The code is built with the following idea:

- Each function is a task: Install Software, Remove Software, Update Files etc.
- Tasks are executed in order.

There is also a new simple binary to rename files, use this at your own risk. 
It will ask for confirmation before renaming. `node node_modules/ts-migration-helper/bin/rename.js`.

Program is not supposed to be installed with `-g` and that is why `rename` is not included in the `json.bin`.


## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ts-migration-helper.svg
[npm-url]: https://www.npmjs.com/package/ts-migration-helper
[ci-image]: https://github.com/santimirandarp/ts-migration-helper/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/santimirandarp/ts-migration-helper/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/ts-migration-helper.svg
[download-url]: https://www.npmjs.com/package/ts-migration-helper
