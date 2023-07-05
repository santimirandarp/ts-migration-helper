import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';

import { execAsync } from '../utils/execAsync.js';
import { printRed, printYellow } from '../utils/print.js';

export const installs = [
  {
    command: 'typescript',
    choice: {
      name: 'TypeScript',
      value: 'ts',
      checked: true,
    },
  },
  {
    command: 'eslint-config-cheminfo-typescript',
    choice: {
      name: 'cheminfo-eslint',
      value: 'eslint',
      checked: true,
    },
  },
  {
    command:
      '@babel/preset-typescript @babel/plugin-transform-modules-commonjs',
    choice: {
      name: 'Babel',
      value: 'babel',
      checked: true,
    },
  },
  {
    command: '@types/jest',
    choice: {
      name: 'Jest',
      value: 'jest',
      checked: true,
    },
  },
  {
    command: 'rimraf',
    choice: {
      name: 'Rimraf',
      value: 'rimraf',
      checked: true,
    },
  },
];

export async function installSoftware() {
  const answers = await checkbox({
    message: 'Install (dev dependencies) ?',
    choices: installs.map((install) => install.choice),
  });

  if (answers.length) {
    const msg = 'Installing Software';
    printYellow(msg);
    try {
      const command = `npm i -D ${answers.join(' ')}`;
      await execAsync(command);
      console.log(chalk.green('Installed Software'), command);
    } catch (e) {
      printRed(msg);
      if (typeof e === 'string') throw new Error(e);
    }
  }
}
