import { execSync } from 'node:child_process';
import { unlinkSync, existsSync } from 'node:fs';

import { checkbox } from '@inquirer/prompts';

import { printYellow } from '../utils/index.js';

export async function removeOld() {
  const msg = 'Removing Old Software';
  printYellow(`Section: ${msg}`);
  return removeOldLocal();
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
    if (!answers.includes(value)) continue;

    switch (action) {
      case 'npmRemove':
        commands.push(value);
        break;
      case 'removeFile':
        if (existsSync(value)) unlinkSync(value);
        break;
      default:
        break;
    }
  }

  if (commands.length) {
    const npmCommand = `npm remove ${commands.join(' ')}`;
    return execSync(npmCommand);
  }
}

interface RemoveChoice {
  action: 'npmRemove' | 'removeFile';
  choice: {
    name: string;
    value: string;
    checked: boolean;
  };
}
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
        value: '.babelrc.json',
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
