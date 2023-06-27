import { exec } from 'node:child_process';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { childProcessErrorHandling } from '../utils/childProcessHandler.js';

export function installESLint() {
  inquirer
    .prompt({
      name: 'installESLintConfig',
      message: 'Install eslint-config-typescript?',
    })
    .then((answers) => {
      if (/^y[es]?$/i.test(answers.installESLintConfig)) {
        exec(
          'npm install -D eslint-config-cheminfo-typescript',
          childProcessErrorHandling,
        );
      }
      console.log(chalk.green('ESLint configured!'));
    })
    .catch((err) => {
      console.error(err);
    });
}
