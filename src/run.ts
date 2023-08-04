import { existsSync } from 'node:fs';

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
export async function run() {
  if (!existsSync('package.json')) {
    console.error(
      '\npackage.json not found. Run this program in the project root.',
    );
    process.exit(1);
  }
  await npmCheckUpdates();
  await removeOld();
  await installSoftware();
  await configureSoftware();
  await updateGitignore();
  await updatePackageJson();
  await replaceWorkflow();
}
