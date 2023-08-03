import { mkdir, writeFile } from 'fs/promises';

import { input, confirm } from '@inquirer/prompts';
import got from 'got';

import { fileExists } from '../utils/fileExists.js';
import { printYellow, printRed } from '../utils/print.js';

const sources = [
  {
    webSource:
      'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml',
    path: '.github/workflows/nodejs.yml',
  },
  {
    webSource:
      'https://raw.githubusercontent.com/cheminfo/generator-cheminfo/main/.github/workflows/release.yml',
    path: '.github/workflows/release.yml',
  },
  {
    webSource:
      'https://raw.githubusercontent.com/cheminfo/wdf-parser/main/.github/workflows/typedoc.yml',
    path: '.github/workflows/typedoc.yml',
  },
];
export async function replaceWorkflow() {
  const branchName = await input({
    message: 'What is the default branch of your repository? master/main/other',
    default: 'main',
  });
  const msg = 'Replacing workflows';
  printYellow(`Section: ${msg}`);

  for (const { webSource, path } of sources) {
    const data = await got(webSource).text();

    const answer = await confirm({
      message: `New ${
        path.split('/').pop() || ''
      } Workflow? (Warning: overwrites files with the same name)`,
      default: true,
    });
    if (!answer) {
      continue;
    }

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
}
