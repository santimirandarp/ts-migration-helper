import { unlink } from 'node:fs/promises';

import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';

import {
  printYellow,
  printRed,
  fileExists,
  execAsync,
} from '../utils/index.js';

export async function removeOld() {
  const msg = 'Old Config Files and Software.';
  printYellow(msg);
  try {
    await removeOldLocal();
  } catch (e) {
    printRed(msg);
    if (typeof e === 'string') throw new Error(e);
  }
}
/**
 * Prompts the user to remove old config files and software.
 */
async function removeOldLocal() {
  const removes = makeRemoveChoices();
  const answers = await checkbox({
    message: 'Remove ...?',
    choices: removes.map(({ choice }) => choice),
  });
  const commands = [];
  for (const {
    action,
    choice: { value },
  } of removes) {
    if (answers.includes(value)) continue;

    switch (action) {
      case 'npmRemove':
        commands.push(value);
        break;
      case 'removeFile':
        if (await fileExists(value)) await unlink(value);
        console.log(chalk.blue(value), ' --> ', chalk.green('removed'));
        break;
      default:
        break;
    }
  }

  if (commands.length) {
    const npmCommand = commands.join(' ');
    await execAsync(`npm remove ${npmCommand}`);
    console.log(chalk.blue(npmCommand, ' --> ', chalk.green('done.')));
  }
}

type RemoveChoice = {
  action: 'npmRemove' | 'removeFile';
  choice: {
    name: string;
    value: string;
    checked: boolean;
  };
};
function makeRemoveChoices(): RemoveChoice[] {
  return [
    {
      action: 'npmRemove',
      choice: {
        name: 'rollup',
        value: 'rollup',
        checked: true,
      },
    },
    {
      action: 'npmRemove',
      choice: {
        name: 'cheminfo-eslint',
        value: 'eslint-config-cheminfo',
        checked: true,
      },
    },
    {
      action: 'removeFile',
      choice: {
        name: 'Babel',
        value: '.babelrc',
        checked: true,
      },
    },
    {
      action: 'removeFile',
      choice: {
        name: 'rollupConfig',
        value: 'rollup.config.js',
        checked: true,
      },
    },
  ];
}
