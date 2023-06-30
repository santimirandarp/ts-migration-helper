import { writeFile } from 'fs/promises';

import chalk from 'chalk';

export async function updateGitignore(file: string) {
  const gitignore = file.split('\n');
  if (!gitignore.includes('lib')) {
    gitignore.push('lib');
    console.log(chalk.green('added lib'));
  }
  if (!gitignore.includes('lib-esm')) {
    gitignore.push('lib-esm');
    console.log(chalk.green('added lib-esm'));
  }
  return writeFile('.gitignore', gitignore.join('\n').concat('\n'));
}
