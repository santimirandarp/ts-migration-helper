#!/usr/bin/env node
import chalk from 'chalk';

import { run } from './run.js';

run()
  .then(() => {
    console.log(
      chalk.green('Done!'),
      'You should now be at the step: ',
      chalk.underline.blueBright(
        'https://github.com/cheminfo/generator-cheminfo/blob/main/ts-migration.md#submit-your-changes',
      ),
    );
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
