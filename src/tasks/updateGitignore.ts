import { readFile, writeFile } from 'fs/promises';
import chalk from 'chalk';

export async function updateGitignore(file: string) {
  console.log(chalk.green('found .gitignore'));
  const gitignore = file.split('\n');
  if (!gitignore.includes('lib')) {
    gitignore.push('lib');
    console.log(chalk.green('added lib to .gitignore'));
  }
  if (!gitignore.includes('lib-esm')) {
    gitignore.push('lib-esm');
    console.log(chalk.green('added lib-esm to .gitignore'));
  }
  return await writeFile('.gitignore', gitignore.join('\n'));
}
