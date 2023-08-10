# ts-migration-helper

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Migrate simple Cheminfo JS projects to Typescript made for personal use.

## Installation

```bash
npm i -g ts-migration-helper
```

## Execution

```bash
npx migration-questions
npx migration-jsrename
```

`migration-jsrename`` command is new, if you happen to try this software, please use with caution.

## Contribute

The code is built with the following idea:

- Each function is a task: Install Software, Remove Software, Update Files etc.
- Tasks are executed in order.

## ToDos

- [ ] add script to switch to `vitest` and clean up `package.json`. - script to replace `@jest/globals` with `vitest` or add the line (as a default at least.) `import { describe, it, expect } from 'vitest';`

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ts-migration-helper.svg
[npm-url]: https://www.npmjs.com/package/ts-migration-helper
[ci-image]: https://github.com/santimirandarp/ts-migration-helper/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/santimirandarp/ts-migration-helper/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/ts-migration-helper.svg
[download-url]: https://www.npmjs.com/package/ts-migration-helper
