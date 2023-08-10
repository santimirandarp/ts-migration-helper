import { rename } from 'node:fs/promises';

import { confirm } from '@inquirer/prompts';
import { search } from 'simple-recursive-search';

import {
  getPackageJson,
  printGreen,
  printRed,
  printYellow,
} from './utils/index.js';

printYellow('Change files extension (ignores node_modules)');

getPackageJson(); //errors if not found.

(async function renameFiles() {
  const saysYes = await confirm({
    message: 'Change src/**/*.js to src/**/*.ts?',
    default: false,
  });
  if (saysYes) {
    const files = await search('./src', {
      excludeDir(dirname) {
        return dirname.includes('node_modules');
      },
    });
    console.log(files);
    const replace = await confirm({
      message:
        'Please, double check that all file paths look correct. Do you want to rename the files?',
      default: false,
    });
    if (replace) {
      for (const file of files) {
        await rename(file, file.replace(/\.js$/, '.ts'));
      }
      printGreen('Done!');
    }
  }
})().catch((err) => {
  printRed("Oops, something went wrong. Couldn't rename files.");
  console.error(err);
});
