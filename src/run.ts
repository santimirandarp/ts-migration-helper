import { readFile } from 'node:fs/promises';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { questions } from './setup/questions.js';
import {
  installSoftware,
  configureSoftware as cf,
  updatePackageJson,
  updateGitignore,
  removeSoftware,
  replaceWorkflow,
} from './tasks/index.js';
import { fileExists } from './utils/fileExists.js';

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
      await readFile('.gitignore', 'utf8')
        .then(async (file) => {
          return updatePackageJson(file);
        })
        .catch((error) => {
          console.log(chalk.red('Error Updating package.json'));
          throw new Error(error);
        });
    }

    // update .gitignore
    if (gitignore && (await fileExists('.gitignore'))) {
      await readFile('.gitignore', 'utf8')
        .then(async (file) => {
          return updateGitignore(file);
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
    await removeSoftware(removes).catch((error) => {
      console.log(chalk.red('Error Removing Software', removes));
      throw new Error(error);
    });
  });
}
