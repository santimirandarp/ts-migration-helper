import { readFileSync, writeFileSync } from 'fs';

import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';

import { printYellow } from '../utils/print.js';
import { sortByKeys } from '../utils/sortByKeys.js';

const SCRIPTS_TO_DELETE = ['compile', 'prePublishOnly', 'jest'];

const UPDATE_SCRIPTS = {
  'check-types': 'tsc --noEmit',
  clean: 'rimraf lib lib-esm',
  prepack: 'npm run tsc',
  tsc: 'npm run clean && npm run tsc-cjs && npm run tsc-esm',
  'tsc-cjs': 'tsc --project tsconfig.cjs.json',
  'tsc-esm': 'tsc --project tsconfig.esm.json',
};

export async function updatePackageJson() {
  const msg = 'Updating package.json';
  printYellow(`Section: ${msg}`);

  const answer = await confirm({
    message: 'Update package.json ?',
    default: true,
  });
  if (!answer) {
    printYellow('Skipping package.json update.');
    return;
  }

  const json = JSON.parse(readFileSync('package.json', 'utf8'));

  json.main = './lib/index.js';
  json.module = './lib-esm/index.js';
  json.types = './lib/index.d.ts';
  json.files = ['src', 'lib', 'lib-esm'];
  json.scripts = { ...json.scripts, ...UPDATE_SCRIPTS };

  SCRIPTS_TO_DELETE.forEach((script) => {
    if (script in json.scripts) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete json.scripts[script];
    }
  });

  if (json.scripts.test && !json.scripts.test.includes('check-types')) {
    json.scripts.test += ' && npm run check-types';
  }
  json.scripts = sortByKeys(json.scripts);
  writeFileSync('package.json', `${JSON.stringify(json, null, 2)}\n`);
  console.log(chalk.green('updated package.json'));
  return;
}
