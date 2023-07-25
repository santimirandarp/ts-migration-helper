import chalk from 'chalk';

import {
  installSoftware,
  configureSoftware,
  updatePackageJson,
  updateGitignore,
  removeOld,
  replaceWorkflow,
} from './tasks/index.js';
import { fileExists } from './utils/index.js';
/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
export async function run() {
  console.log('\n', chalk.bgRed.yellow('Use at your own risk.'), '\n');

  if (!(await fileExists('package.json'))) {
    console.error(
      '\npackage.json not found. Run this program in the project root.',
    );
    process.exit(1);
  }

  await removeOld();
  await installSoftware();
  await configureSoftware();
  await updateGitignore();
  await updatePackageJson();
  await replaceWorkflow();
}
