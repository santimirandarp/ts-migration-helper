import { execAsync } from '../utils/execAsync.js';

import { InstallNames, installs } from '../setup/installs.js';
import chalk from 'chalk';

export async function installSoftware(keys: InstallNames[]) {
  const command = `npm i -D ${keys
    .map((key) => installs[key].command)
    .join(' ')}`;
  await execAsync(command);
  console.log(chalk.green('Installed Software'), command);
}
