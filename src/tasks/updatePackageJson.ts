import chalk from 'chalk';
import { writeFile } from 'fs/promises';

const SCRIPTS_TO_DELETE = ['compile', 'prePublishOnly', 'jest'];

const UPDATE_SCRIPTS = {
  'check-types': 'tsc --noEmit',
  clean: 'rimraf lib lib-esm',
  prepack: 'npm run tsc',
  tsc: 'npm run clean && npm run tsc-cjs && npm run tsc-esm',
  'tsc-cjs': 'tsc --project tsconfig.cjs.json',
  'tsc-esm': 'tsc --project tsconfig.esm.json',
};

export async function updatePackageJson(file: string) {
  const json = JSON.parse(file);

  json.main = './lib/index.js';
  json.module = './lib-esm/index.js';
  json.types = './lib/index.d.ts';
  json.files = ['src', 'lib', 'lib-esm'];
  json.scripts = { ...UPDATE_SCRIPTS, ...json.scripts };

  SCRIPTS_TO_DELETE.forEach((script) => {
    if (json.scripts[script]) delete json.scripts[script];
  });

  if (json.scripts.test) {
    json.scripts.test += ' && npm run check-types';
  } else {
    json.scripts.test =
      'npm run test-only && npm run eslint && npm run prettier && npm run check-types';
  }

  await writeFile('package.json', JSON.stringify(json, null, 2) + '\n');
  console.log(chalk.green('updated package.json'));
}
