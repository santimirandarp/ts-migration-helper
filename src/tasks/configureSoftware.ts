import { readFile, writeFile } from 'fs/promises';

import { select, checkbox } from '@inquirer/prompts';
import YAML from 'yaml';

import { fileExists } from '../utils/fileExists.js';

/**
 * Offers a way to add the config files to the most common config files.
 */
export async function configureSoftware() {
  const configs = getConfigs();

  const answers = await checkbox({
    message: 'Config Files (no overwrite without prompting):',
    choices: configs.map(({ choice }) => choice),
  });
  if (answers.length === 0) return;

  for (const item of configs) {
    const { value: filename, name } = item.choice;
    const endsWithJS = filename.endsWith('.js');
    if (!answers.includes(name)) continue;

    if (await fileExists(filename)) {
      const action = await select({
        message: `How to handle ${filename}?`,
        choices: getConfigActions(endsWithJS),
      });
      await handleAction(filename, item.config, action);
    } else {
      await handleAction(filename, item.config, 'overwrite');
    }
  }
}

/**
 * What to do with the config file.
 * @param filename - The name of the file to write to.
 * @param config - The config object or string to write to the file.
 * @param action - The action to take (overwrite, merge, skip)
 * @returns
 */
async function handleAction(filename: string, config: any, action: string) {
  const isJson = filename.endsWith('.json');
  const isYaml = filename.endsWith('.yml');
  const isJs = filename.endsWith('.js');

  if (action === 'overwrite') {
    if (isJson) {
      await writeFile(filename, JSON.stringify(config, null, 2).concat('\n'));
    } else if (isYaml) {
      await writeFile(filename, YAML.stringify({ extends: config }));
    } else if (isJs) {
      await writeFile(filename, config as string);
    }
  } else if (action === 'merge') {
    const file = await readFile(filename, 'utf-8');
    if (isJson) {
      const jsonObject = JSON.parse(file);
      if (typeof jsonObject !== 'object') {
        throw new Error(`Expected ${filename} to be an object`);
      }
      await writeFile(
        filename,
        JSON.stringify({ ...jsonObject, config }, null, 2).concat('\n'),
      );
    } else if (filename.endsWith('.yml')) {
      const yamlObject = YAML.parse(file);
      await writeFile(
        filename,
        YAML.stringify({ ...yamlObject, extends: config }),
      );
    }
  }
}

/**
 * Used to create the prompt for the user to select how to handle the config file.
 * @param js - Disable merge option for js files.
 * @returns The choices for the prompt.
 */
function getConfigActions(js = false) {
  return [
    {
      key: 'o',
      name: 'overwrite',
      value: 'overwrite',
      short: 'Overwriting File',
    },
    {
      key: 'm',
      name: 'merge',
      value: 'merge',
      short: 'Merging File',
      disabled: js,
    },
    {
      key: 's',
      name: 'skip',
      value: 'skip',
      short: 'Skipping File',
    },
  ];
}

function getConfigs() {
  return [
    {
      choice: {
        name: 'tsconfig',
        value: 'tsconfig.json',
        checked: true,
      },
      config: {
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
      },
    },
    {
      choice: {
        name: 'tsconfigCjs',
        value: 'tsconfig.cjs.json',
        checked: true,
      },
      config: {
        extends: './tsconfig.json',
        compilerOptions: {
          module: 'commonjs',
          declaration: true,
          declarationMap: true,
        },
        exclude: ['./src/**/__tests__'],
      },
    },
    {
      choice: {
        value: 'tsconfig.esm.json',
        checked: true,
        name: 'tsconfigEsm',
      },
      config: {
        extends: './tsconfig.cjs.json',
        compilerOptions: {
          module: 'es2020',
          outDir: 'lib-esm',
        },
      },
    },
    {
      choice: {
        value: 'babel.config.js',
        checked: true,
        name: 'babel',
      },
      config: `module.exports = { 
    presets: ['@babel/preset-typescript'], 
    plugins: ['@babel/plugin-transform-modules-commonjs'], 
   };`,
    },
    {
      choice: {
        name: 'eslint',
        value: '.eslintrc.yml',
        checked: true,
      },
      config: 'cheminfo-typescript',
    },
  ];
}
