import { confirm } from '@inquirer/prompts';
import { execSync } from 'node:child_process';

import { printYellow } from '../utils/index.js';

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
  const command = 'npx npm-check-updates -u';
  return execSync(command);
}
