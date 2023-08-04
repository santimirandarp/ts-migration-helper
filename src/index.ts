#!/usr/bin/env node
import { existsSync } from 'node:fs';

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
/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
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
  if (!existsSync('package.json')) {
    console.error(
      '\npackage.json not found. Run this program in the project root.',
    );
    process.exit(1);
  }
  for (const task of tasks) await task();
})()
  .then(() => {
    console.log(
      chalk.green('Done!'),
      'You should now be at the step: ',
      chalk.underline.blueBright(
        'https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md#submit-your-changes',
      ),
    );
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
