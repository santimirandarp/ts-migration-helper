import { configs } from './configs.js';
import { installs } from './installs.js';
import { removes } from './removes.js';

export const questions = [
  {
    name: 'install',
    message: 'Install (dev dependencies) ?',
    type: 'checkbox',
    choices: [
      installs.ts.choice,
      installs.eslint.choice,
      installs.babel.choice,
      installs.jest.choice,
      installs.rimraf.choice,
    ],
  },
  {
    name: 'configs',
    message: 'Config Files (no overwrite without prompting):',
    type: 'checkbox',
    choices: [
      configs.tsconfig.choice,
      configs.tsconfigCjs.choice,
      configs.tsconfigEsm.choice,
      configs.eslint.choice,
      configs.babel.choice,
    ],
  },
  {
    name: 'json',
    message: 'Update package.json ?',
    type: 'confirm',
    default: true,
  },
  {
    name: 'gitignore',
    message: 'Update .gitignore ?',
    type: 'confirm',
    default: true,
  },
  {
    name: 'removes',
    message: 'Remove (dev dependencies) ?',
    type: 'checkbox',
    choices: [
      removes.rollup.choice,
      removes.eslint.choice,
      removes.babelrc.choice,
      removes.rollupConfig.choice,
    ],
  },
  {
    name: 'workflow',
    message: 'New nodejs Workflow ?',
    type: 'confirm',
    default: true,
  },
];
