import { existsSync, mkdirSync } from 'fs';
import { join } from 'node:path';
import { input, confirm } from '@inquirer/prompts';
import got from 'got';

import { writeDataToFile, printYellow } from '../utils/index.js';

const remoteBase =
  'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/';
const localBase = '.github/workflows';
const sources = ['nodejs-ts.yml', 'typedoc.yml', 'release.yml', 'lactame.yml'];

export async function replaceWorkflow() {
  const branchName = await input({
    message: 'What is the default branch name ? /main/master/other',
    default: 'main',
  });
  const msg = 'Replacing workflows...';
  printYellow(`Section: ${msg}`);

  for (const source of sources) {
    const data = await got(join(remoteBase, source)).text();

    const answer = await confirm({
      message: `Add ${source} Workflow ?`,
      default: true,
    });
    if (!answer) {
      continue;
    }

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
