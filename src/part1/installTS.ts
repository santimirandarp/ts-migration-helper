import childProcess from 'child_process';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { childProcessErrorHandling } from '../utils/childProcessHandler.js';

export function installTS() {
  inquirer
    .prompt({
      name: 'installTS',
      message: 'Install TypeScript? Y/n',
    })
    .then((answers) => {
      if (/^y[es]?$/i.test(answers.installTS)) {
        childProcess.exec(
          'npm install -D typescript',
          childProcessErrorHandling,
        );
        console.log(chalk.green('TypeScript installed!'));
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
