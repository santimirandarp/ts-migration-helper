import { writeFileSync as wfs } from 'fs';

import chalk from 'chalk';
import inquirer from 'inquirer';

import { fileExists } from '../utils/fileExists.js';

const tsconfig = {
  compilerOptions: {
    allowJs: true,
    esModuleInterop: true,
    moduleResolution: 'node',
    outDir: 'lib',
    sourceMap: true,
    strict: true,
    target: 'es2020',
  },
  include: ['./src/**/*'],
};
const tsconfigCjsJson = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'commonjs',
    declaration: true,
    declarationMap: true,
  },
  exclude: ['./src/**/__tests__'],
};
const tsconfigEsmJson = {
  extends: './tsconfig.json',
  compilerOptions: {
    module: 'commonjs',
    declaration: true,
    declarationMap: true,
  },
  exclude: ['./src/**/__tests__'],
};
export function configureTS() {
  // check tsconfig.json exist
  const configs = [
    {
      name: './tsconfig.json',
      config: tsconfig,
    },
    {
      name: './tsconfig.cjs.json',
      config: tsconfigCjsJson,
    },
    {
      name: './tsconfig.esm.json',
      config: tsconfigEsmJson,
    },
  ];
  for (const { name: fName, config } of configs) {
    const tsconfigExists = fileExists(fName);
    const msg = tsconfigExists ? `Previous ${fName} Found. Replace` : 'Create';
    inquirer
      .prompt({
        name: 'tsconfig',
        message: `${msg} ${fName} file? Y/n`,
      })
      .then((answers) => {
        if (/^y[es]?$/i.test(answers.tsconfig)) {
          wfs(fName, JSON.stringify(config, null, 2).concat('\n'));
          console.log(chalk.green(` ${fName} configured!`));
        } else {
          console.log(chalk.bgRed('Create a tsconfig.json file with: '));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
