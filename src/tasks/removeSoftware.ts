import { execAsync } from '../utils/execAsync.js';

import chalk from 'chalk';

import { type RemovesKeys, removes } from '../setup/removes.js';

export async function removeSoftware(name: RemovesKeys[]) {
  const commands = [];
  const filesToRemove = [];
  for (const key of name) {
    const item = removes[key];
    if ('npm' in item) {
      commands.push(item.npm);
    } else if ('file' in item) {
      filesToRemove.push(item.file);
    }
  }

  const npmCommand = 'npm remove ' + commands.join(' ');
  const remove = 'rm -i ' + filesToRemove.join(' ');
  try {
    await Promise.all([execAsync(npmCommand), execAsync(remove)]);
  } catch (e) {
    console.log('Error removing software', e);
  }
  console.log(remove, '\n', npmCommand, '\n', chalk.green('done'));
}
