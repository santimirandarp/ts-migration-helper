import { readFile } from 'node:fs/promises';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { questions } from './setup/questions.js';
import {
  installSoftware,
  configureSoftware as cf,
  updatePackageJson,
  updateGitignore,
  removeOld,
  replaceWorkflow,
} from './tasks/index.js';
import { fileExists, printRed, printYellow } from './utils/index.js';

const workflowSources = {
  web: 'https://raw.githubusercontent.com/cheminfo/.github/main/workflow-templates/nodejs-ts.yml',
  path: '.github/workflows/nodejs.yml',
};
/**
 * Please update if the guide changes.
 * https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md
 */
export async function run() {
  console.log('\n', chalk.bgRed.yellow('Use at your own risk.'), '\n');

  if (!(await fileExists('package.json'))) {
    console.error(
      '\npackage.json not found. Run this program in the project root.',
    );
    process.exit(1);
  }

  // not sure how to automatically get the answer types
  await inquirer.prompt(questions).then(async (response) => {
    // user answers
    const {
      install,
      configs,
      updateJson,
      updateGitignore: upg,
      removes,
      replaceWorkflow: rpw,
    } = response;

    // remove software (first, to reduce conflicts)
    if (removes.length > 0) {
      const msg = 'Removing Old Config Files and Software';
      printYellow(msg);
      await removeOld(removes).catch((error) => {
        printRed(msg);
        throw new Error(error);
      });
    }

    // install software
    if (install.length > 0) {
      const msg = 'Installing Software';
      printYellow(msg);
      await installSoftware(install).catch((error) => {
        printRed(msg);
        throw new Error(error);
      });
    }

    // create config files
    const msg = 'Configuring Software';
    printYellow(msg);
    for (const answer of configs) {
      await cf(answer).catch((error) => {
        printRed(msg);
        throw new Error(error);
      });
    }

    // update package.json
    if (updateJson) {
      const msg = 'Updating package.json';
      printYellow(msg);
      await readFile('package.json', 'utf8')
        .then((file) => updatePackageJson(file))
        .catch((error) => {
          printRed(msg);
          throw new Error(error);
        });
    }

    // update .gitignore
    if (upg && (await fileExists('.gitignore'))) {
      const msg = 'Updating .gitignore';
      printYellow(msg);
      await readFile('.gitignore', 'utf8') // This line is correct
        .then(async (file) => {
          return updateGitignore(file);
        })
        .catch((error) => {
          printRed(msg);
          throw new Error(error);
        });
    }

    // replace workflow
    if (rpw) {
      const msg = 'Replacing Workflow';
      printYellow(msg);
      const { web, path } = workflowSources;
      await replaceWorkflow(path, web).catch((error) => {
        printRed(msg);
        throw new Error(error);
      });
    }
  });
}
