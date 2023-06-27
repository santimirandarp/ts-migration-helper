import { writeFileSync as wfs } from 'node:fs';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { fileExists } from '../utils/fileExists.js';

const babelConfigCode = `module.exports = { 
    presets: ['@babel/preset-typescript'], 
    plugins: ['@babel/plugin-transform-modules-commonjs'], 
   };`;

// prompt to create or update .eslintrc.yml
export function configureBabel() {
  // check .eslintrc.yml exist
  const babelConfig = './babel.config.js';
  const babelConfigExists = fileExists(babelConfig);
  const msg = babelConfigExists
    ? `Previous ${babelConfig} Found. Replace: ${babelConfig}`
    : `Create ${babelConfig}`;

  inquirer
    .prompt({
      name: 'createBabelConfig',
      message: msg,
    })
    .then((answers) => {
      if (/^y[es]?$/i.test(answers.createBabelConfig)) {
        wfs(babelConfig, babelConfigCode);
      }
      console.log(chalk.green('Babel is configured!'));
    })
    .catch((err) => {
      console.error(err);
    });
}
