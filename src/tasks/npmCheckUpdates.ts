import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';

import { printYellow, printRed, execAsync } from '../utils/index.js';

// prompt to run ncu -u
export async function npmCheckUpdates() {
  const msg = 'npm-check-updates';
  printYellow(`Section: ${msg}`);

  const answer = await confirm({
    message: 'Run npm-check-updates -u ?',
    default: true,
  });
  if (!answer) {
    printYellow('Skipping npm-check-updates.');
    return;
  }
  try {
    const command = 'npx npm-check-updates -u';
    console.log('This will take a few seconds', chalk.blue(command));
    await execAsync(command);
    console.log(chalk.green('ran npm-check-updates -u'));
  } catch (e) {
    printRed(msg);
    if (typeof e === 'string') throw new Error(e);
  }
}
