import { writeFileSync, existsSync } from 'fs';
import { basename } from 'path';

import { select } from '@inquirer/prompts';

/**
 * Prompts to write data, overwrite, or skip.
 */
export async function writeDataToFile(filePath: string, data: string) {
  if (!existsSync(filePath)) {
    return writeFileSync(filePath, data);
  }
  const action = await select({
    message: `How to handle ${basename(filePath)}?`,
    choices: getFileActions(),
  });
  return action === 'overwrite' && writeFileSync(filePath, data);
}

function getFileActions() {
  return [
    {
      key: 'o',
      name: 'overwrite',
      value: 'overwrite',
      short: 'Overwriting File',
    },
    {
      key: 's',
      name: 'skip',
      value: 'skip',
      short: 'Skipping File',
    },
  ];
}
