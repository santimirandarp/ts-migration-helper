import { execSync } from 'node:child_process';

import { checkbox } from '@inquirer/prompts';

import { printYellow } from '../utils/print.js';

export const installs = [
  {
    command: 'typescript',
    choice: {
      name: 'TypeScript',
      value: 'typescript',
      checked: true,
    },
  },
  {
    command: 'eslint-config-cheminfo-typescript eslint-plugin-jest',
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
  const msg = 'Installing Software';
  printYellow(`Section: ${msg}`);

  const answers = await checkbox({
    message: 'Install (dev dependencies) ?',
    choices: installs.map((install) => install.choice),
  });

  if (answers.length) {
    const commands: string[] = [];
    for (const install of installs) {
      if (answers.includes(install.choice.value)) {
        commands.push(install.command);
      }
    }
    const command = `npm i -D ${commands.join(' ')}`;
    return execSync(command);
  }
}
