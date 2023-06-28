import { readFile, writeFile } from 'fs/promises';

import inquirer from 'inquirer';
import YAML from 'yaml';

import { fileExists } from '../utils/fileExists.js';

import { configs } from '../setup/configs.js';
import chalk from 'chalk';

type KeyNames = keyof typeof configs;
export async function configureSoftware(name: KeyNames) {
  const fName = configs[name].choice.name;
  const endsWithJS = fName.endsWith('.js');

  if (await fileExists(fName)) {
    console.log(chalk.yellow(`File ${fName} already exists.`));
    const answer = await inquirer.prompt([makeConfigsPrompt(endsWithJS, name)]);
    console.log(answer);
    await writeConfig(answer, name);
  } else {
    await writeConfig('overwrite', name);
  }
}

// messy fn but that is my best atm
async function writeConfig(answer: string, name: KeyNames) {
  if (answer === 'skip') return;
  const fName = configs[name].choice.name;
  const config = configs[name].config;
  switch (answer) {
    case 'overwrite': {
      if (fName.endsWith('.json')) {
        await writeFile(fName, JSON.stringify(config, null, 2).concat('\n'));
      } else if (fName.endsWith('.yml')) {
        await writeFile(fName, YAML.stringify({ extends: config }));
      } else if (fName.endsWith('.js')) {
        await writeFile(fName, config as string);
      }
      break;
    }
    case 'merge': {
      const file = await readFile(fName, 'utf-8');
      if (fName.endsWith('.json')) {
        const jsonObject = JSON.parse(file);
        await writeFile(
          fName,
          JSON.stringify(
            { ...jsonObject, ...(config as object) },
            null,
            2,
          ).concat('\n'),
        );
      } else if (fName.endsWith('.yml')) {
        const yamlObject = YAML.parse(file);
        await writeFile(
          fName,
          YAML.stringify({ ...yamlObject, extends: config }),
        );
      }
      break;
    }
  }
}

function makeConfigsPrompt(js = false, name: KeyNames) {
  return {
    choices: [
      {
        key: 'o',
        name: 'Overwrite',
        value: 'overwrite',
        short: 'Overwriting File',
      },
      {
        key: 'm',
        name: 'Merge',
        value: 'merge',
        short: 'Merging File',
        disabled: js,
      },
      { key: 's', name: 'Skip', value: 'skip', short: 'Skipping File' },
    ],
    type: 'list',
    default: 0,
    name,
  };
}
