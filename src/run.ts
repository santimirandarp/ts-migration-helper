import { readFile } from 'node:fs/promises';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { fileExists } from './utils/fileExists.js';

import {
  installSoftware,
  configureSoftware as cf,
  updatePackageJson,
  updateGitignore,
  removeSoftware,
  replaceWorkflow,
} from './tasks/index.js';
import { questions } from './setup/questions.js';
import { getPackageJson } from './utils/checkPackageJson.js';

const workflowSources = {
  web: 'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml',
  path: '.github/workflows/nodejs.yml',
};
/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
export async function run() {
  console.log(
    '\n',
    chalk.underline.cyan('No Overwriting without confirmation.'),
    '\n',
  );

  // errors if not found
  const packageJson = await getPackageJson();

  await inquirer.prompt(questions).then(async (response) => {
    const { install, configs, json, gitignore, removes, workflow } = response;

    // install software
    if (install.length > 0) {
      await installSoftware(install).catch((error) => {
        console.log(chalk.red('Error Installing Software', install));
        throw new Error(error);
      });
    }

    // create config files
    for (const answer of configs) {
      await cf(answer).catch((error) => {
        console.log(chalk.red('Error Configuring Software', answer));
        throw new Error(error);
      });
    }

    // update package.json
    if (json && (await fileExists('package.json'))) {
      const file = await readFile('.gitignore', 'utf-8')
        .then(async (file) => {
          return await updatePackageJson(file);
        })
        .catch((error) => {
          console.log(chalk.red('Error Updating package.json'));
          throw new Error(error);
        });
    }

    // update .gitignore
    if (gitignore && (await fileExists('.gitignore'))) {
      const file = await readFile('.gitignore', 'utf-8')
        .then(async (file) => {
          return await updateGitignore(file);
        })
        .catch((error) => {
          console.log(chalk.red('Error Updating .gitignore'));
          throw new Error(error);
        });
    }

    // replace workflow
    if (workflow) {
      const { web, path } = workflowSources;
      await replaceWorkflow(path, web).catch((error) => {
        console.log(chalk.red('Error Replacing Workflow'));
        throw new Error(error);
      });
    }
    // remove software
    for (const answer of removes) {
      await removeSoftware(answer);
    }
  });
}
