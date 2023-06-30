import { writeFile } from 'fs/promises';

import got from 'got';
import inquirer from 'inquirer';

export async function replaceWorkflow(path: string, webSource: string) {
  const data = await got(webSource).text();
  const { branch } = await inquirer.prompt([
    {
      type: 'input',
      name: 'branch',
      message:
        'What is the default branch of your repository? master/main/other',
      default: '',
    },
  ]);
  const updated = branch
    ? data.replace('$default-branch', branch.trim())
    : data;
  await writeFile(path, updated);
}
