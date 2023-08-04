import { readFile, writeFile } from 'fs/promises';

import { confirm } from '@inquirer/prompts';

import { printYellow } from '../utils/index.js';

/**
 * Asynchronously updates the .gitignore file to ensure that 'lib' and 'lib-esm' are present.
 *
 */
export async function updateGitignore() {
  const msg = 'Updating .gitignore';
  printYellow(`Section: ${msg}`);

  const answer = await confirm({
    message: 'Update .gitignore ?',
    default: true,
  });
  if (!answer) {
    printYellow('Skipping .gitignore update.');
    return;
  }
  const fileContents = await readFile('.gitignore', 'utf8');
  const gitignore = fileContents.split('\n');
  let result = 0;
  for (const line of gitignore) {
    if (line === 'lib') result += 1;
    else if (line === 'lib-esm') result += 2;
  }

  if (!(result & 1)) gitignore.push('lib');
  if (!(result >> 1)) gitignore.push('lib-esm');

  await writeFile('.gitignore', gitignore.join('\n').concat('\n'));
  return;
}
