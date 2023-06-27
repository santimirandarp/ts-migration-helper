import { exec } from 'child_process';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { childProcessErrorHandling } from '../utils/childProcessHandler.js';

export function installBabel() {
  inquirer
    .prompt({
      name: 'babel',
      message: 'Install babel modules and jest types?',
    })
    .then((answers) => {
      if (/^y[es]?$/i.test(answers.babel)) {
        exec(
          'npm install -D @babel/preset-typescript @babel/plugin-transform-modules-commonjs @types/jest',
          childProcessErrorHandling,
        );
        console.log(chalk.green('Babel configured!'));
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
