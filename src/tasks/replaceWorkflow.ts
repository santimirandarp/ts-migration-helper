import { mkdir, writeFile } from 'fs/promises';

import { input, confirm } from '@inquirer/prompts';
import got from 'got';

import { fileExists } from '../utils/fileExists.js';
import { printYellow, printRed } from '../utils/print.js';

export async function replaceWorkflow() {
  const webSource =
    'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml';
  const path = '.github/workflows/nodejs.yml';

  const msg = 'Replacing workflow';
  printYellow(`Section: ${msg}`);

  const data = await got(webSource).text();

  const answer = await confirm({
    message: 'New nodejs Workflow ?',
    default: true,
  });
  if (!answer) {
    printYellow('Skipping package.json update.');
    return;
  }

  const branchName = await input({
    message: 'What is the default branch of your repository? master/main/other',
    default: '',
  });

  try {
    printYellow(msg);
    const updated = branchName
      ? data.replace('$default-branch', branchName.trim())
      : data;
    if (!(await fileExists(path))) {
      await mkdir('.github/workflows', { recursive: true });
    }
    await writeFile(path, updated);
  } catch (e) {
    printRed(msg);
    if (typeof e === 'string') throw new Error(e);
  }
}
