import { readFileSync as rfs } from 'fs';

import chalk from 'chalk';

import { fileExists } from './fileExists.js';

/**
 * Checks for the presence of a package.json file.
 * @returns {boolean} - true if package.json is found, or the JSON object
 * contained in package.json if it is found.
 */
export function checkForPackageJSON() {
  if (fileExists('./package.json')) {
    console.log(chalk.green('package.json found!'));
    return JSON.parse(rfs('./package.json', 'utf8'));
  }
  return false;
}
