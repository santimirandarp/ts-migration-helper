import { readFileSync as rfs, writeFileSync as wfs } from 'node:fs';

import chalk from 'chalk';
import inquirer from 'inquirer';
import YAML from 'yaml';

import { fileExists } from '../utils/fileExists.js';

// prompt to create or update .eslintrc.yml
export function configureESLint() {
  // check .eslintrc.yml exist
  const eslintConfig = './.eslintrc.yml';
  const eslintConfigExists = fileExists(eslintConfig);
  const msg = eslintConfigExists
    ? `Previous ${eslintConfig} Found. Replace extends with extends: cheminfo-typescript`
    : `Create ${eslintConfig} file with extends: cheminfo-typescript`;

  inquirer
    .prompt({
      name: 'createESLintConfig',
      message: msg,
    })
    .then((answers) => {
      if (/^y[es]?$/i.test(answers.createESLintConfig)) {
        const eslintConfigYaml = eslintConfigExists
          ? YAML.parse(rfs(eslintConfig, 'utf8'))
          : {};
        eslintConfigYaml.extends = 'cheminfo-typescript';
        wfs(eslintConfig, YAML.stringify(eslintConfigYaml));
      }
      console.log(chalk.green('ESLint configured!'));
    })
    .catch((err) => {
      console.error(err);
    });
}
