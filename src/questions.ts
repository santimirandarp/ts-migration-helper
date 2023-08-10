/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */

import chalk from 'chalk';

import {
  installSoftware,
  configureSoftware,
  updatePackageJson,
  updateGitignore,
  removeOld,
  replaceWorkflow,
  npmCheckUpdates,
} from './tasks/index.js';
import { getPackageJson } from './utils/getPackageJson.js';

const tasks = [
  npmCheckUpdates,
  removeOld,
  installSoftware,
  configureSoftware,
  updateGitignore,
  updatePackageJson,
  replaceWorkflow,
];
(async function run() {
  getPackageJson()//errors if not found.
  for (const task of tasks) await task();
  console.log( chalk.green('Done!'),);
  console.log(`You can try renaming files with:\n
  node node_modules/ts-migration/bin/rename.js\n
  Use at your own risk.`)
})()
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
