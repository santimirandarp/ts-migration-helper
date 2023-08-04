import {
  existsSync,
  readFileSync as readFile,
  writeFileSync as writeFile,
} from 'fs';

import { select, checkbox } from '@inquirer/prompts';
import YAML from 'yaml';

import { printRed, printYellow } from '../utils/index.js';

/**
 * Prompts to add config files to the project.
 */
export async function configureSoftware() {
  const msg = 'Configuring Software';
  printYellow(`Section: ${msg}`);

  const configs = getConfigs();

  // filenames to add
  const answers = await checkbox({
    message: 'Which config files would you like to add?',
    choices: configs.map(({ choice }) => choice),
  });
  if (answers.length === 0) return;
  // because the object is complex, we map over the options
  // rather than the answers/responses.
  for (const item of configs) {
    try {
      const filename = item.choice.value;
      const endsWithJS = filename.endsWith('.js');
      if (!answers.includes(filename)) continue;
      if (existsSync(filename)) {
        const action = await select({
          message: `How to handle ${filename}?`,
          choices: getConfigActions(endsWithJS),
        });
        await handleAction(filename, item.config, action);
      } else {
        await handleAction(filename, item.config, 'overwrite');
      }
    } catch (e) {
      printRed(msg);
      if (typeof e === 'string') throw new Error(e);
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
    isJson
      ? writeFile(filename, JSON.stringify(config, null, 2).concat('\n'))
      : isYaml
      ? writeFile(filename, YAML.stringify({ extends: config }))
      : isJs
      ? writeFile(filename, config as string)
      : null;
  } else if (action === 'merge') {
    const file = await readFile(filename, 'utf-8');
    if (isJson) {
      const jsonObject = JSON.parse(file);
      writeFile(
        filename,
        JSON.stringify({ ...jsonObject, config }, null, 2).concat('\n'),
      );
    } else if (filename.endsWith('.yml')) {
      const yamlObject = YAML.parse(file);
      writeFile(filename, YAML.stringify({ ...yamlObject, extends: config }));
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
