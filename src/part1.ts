import chalk from 'chalk';

import {
  installTS,
  configureTS,
  installESLint,
  configureESLint,
  installBabel,
  configureBabel,
} from './part1/index.js';
import { checkForPackageJSON } from './utils/checkPackageJson.js';

const packageJson = checkForPackageJSON();
if (!packageJson) {
  console.log(chalk.bgRed('package.json not found!'));
  process.exit(1);
}
/**
 * Sequentially runs the functions to set up a TypeScript project.
 */
export function part1() {
  console.log(
    chalk.bgBlue('Setting up TypeScript to analyze and transpile JS...'),
  );
  installTS();
  configureTS();
  installESLint();
  configureESLint();
  installBabel();
  configureBabel();
}
