import { unlink } from 'node:fs/promises';

import chalk from 'chalk';

import { type RemovesKeys, removes } from '../setup/removes.js';
import { execAsync } from '../utils/execAsync.js';

export async function removeOld(name: RemovesKeys[]) {
  const commands = [];
  for (const key of name) {
    const item = removes[key];
    if ('npm' in item) {
      commands.push(item.npm);
    } else if ('file' in item) {
      try {
        await unlink(item.file);
        console.log(chalk.blue(item.file), ' --> ', chalk.green('removed'));
      } catch (error) {
        // @ts-expect-error unknown type
        if (error?.code === 'ENOENT') {
          console.log(
            chalk.blue(item.file, ' --> ', 'skipping un-existing file.'),
          );
        } else {
          // @ts-expect-error unknown type
          throw new Error(error);
        }
      }
    }
  }

  const npmCommand = `npm remove ${commands.join(' ')}`;
  await execAsync(npmCommand);
  console.log(chalk.blue(npmCommand, ' --> ', chalk.green('done.')));
}
