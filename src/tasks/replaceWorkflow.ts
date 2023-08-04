import { existsSync, mkdirSync } from 'fs';
import { join } from 'node:path';

import { checkbox, input } from '@inquirer/prompts';
import got from 'got';

import { writeDataToFile, printYellow } from '../utils/index.js';

const remoteBase =
  'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/';
const localBase = '.github/workflows';
const selects = [
  {
    choice: {
      name: 'nodejs-ts.yml',
      value: 'nodejs-ts.yml',
      checked: true,
    },
  },
  {
    choice: {
      name: 'typedoc.yml',
      value: 'typedoc.yml',
      checked: true,
    },
  },
  {
    choice: {
      name: 'release.yml',
      value: 'release.yml',
      checked: true,
    },
  },
  {
    choice: {
      name: 'lactame.yml',
      value: 'lactame.yml',
      checked: true,
    },
  },
];
export async function replaceWorkflow() {
  const branchName = await input({
    message: 'What is the default branch name ? /main/master/other',
    default: 'main',
  });
  const msg = 'Replacing workflows...';
  printYellow(`Section: ${msg}`);

  const answers = await checkbox({
    message: `Add Workflow ... ?`,
    choices: selects.map((select) => select.choice),
  });
  for (const source of answers) {
    if (!source) continue;
    const data = await got(join(remoteBase, source)).text();

    printYellow(msg);
    const updated = branchName
      ? data.replace('$default-branch', branchName.trim())
      : data;
    if (!existsSync(join(localBase, source))) {
      mkdirSync('.github/workflows', { recursive: true });
    }
    await writeDataToFile(join(localBase, source), updated);
  }
}
