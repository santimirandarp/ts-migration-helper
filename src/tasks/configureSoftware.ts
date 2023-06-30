import { readFile, writeFile } from 'fs/promises';

import inquirer from 'inquirer';
import YAML from 'yaml';

import { configs } from '../setup/configs.js';
import { fileExists } from '../utils/fileExists.js';

type KeyNames = keyof typeof configs;
export async function configureSoftware(configKeyName: KeyNames) {
  const { filename } = configs[configKeyName];
  const endsWithJS = filename.endsWith('.js');

  if (await fileExists(filename)) {
    const answer = await inquirer.prompt([
      makeConfigsPrompt(configKeyName, endsWithJS),
    ]);
    await handleAction(answer);
  } else {
    // @ts-expect-error problem
    await handleAction({ [configKeyName]: 'overwrite' });
  }
}

/**
 * @param action - overwrite, merge, skip
 * @param configKeyName
 * @returns
 */
async function handleAction(data: Record<KeyNames, string>) {
  const [configKeyName, action] = Object.entries(data)[0] as [KeyNames, string];
  const { filename, config } = configs[configKeyName];
  switch (action) {
    case 'overwrite': {
      if (filename.endsWith('.json')) {
        await writeFile(filename, JSON.stringify(config, null, 2).concat('\n'));
      } else if (filename.endsWith('.yml')) {
        await writeFile(filename, YAML.stringify({ extends: config }));
      } else if (filename.endsWith('.js')) {
        await writeFile(filename, config as string);
      }
      break;
    }
    case 'merge': {
      const file = await readFile(filename, 'utf-8');
      if (filename.endsWith('.json')) {
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
      break;
    }
    case 'skip':
      break;
    default:
      throw new Error(`Unknown action ${action}`);
  }
}
/**
 * Used to create the prompt for the user to select how to handle the config file.
 * @param configKeyName - The KeyName of the config file
 * @param js - Disable merge option for js files.
 * @returns The choices for the prompt.
 */
function makeConfigsPrompt(configKeyName: KeyNames, js = false) {
  return {
    choices: [
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
    ],
    type: 'list',
    default: 0,
    name: configKeyName,
  };
}
