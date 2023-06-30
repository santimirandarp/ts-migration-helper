import { configs } from './configs.js';
import { installs } from './installs.js';
import { removes } from './removes.js';

export const questions = [
  {
    name: 'removes',
    message: 'Remove ...?',
    type: 'checkbox',
    choices: Object.entries(removes).map(([, value]) => {
      return value.choice;
    }),
  },
  {
    name: 'install',
    message: 'Install (dev dependencies) ?',
    type: 'checkbox',
    choices: Object.entries(installs).map(([, value]) => {
      return value.choice;
    }),
  },
  {
    name: 'configs',
    message: 'Config Files (no overwrite without prompting):',
    type: 'checkbox',
    choices: Object.entries(configs).map(([, value]) => {
      return value.choice;
    }),
  },
  {
    name: 'updateJson',
    message: 'Update package.json ?',
    type: 'confirm',
    default: true,
  },
  {
    name: 'updateGitignore',
    message: 'Update .gitignore ?',
    type: 'confirm',
    default: true,
  },
  {
    name: 'replaceWorkflow',
    message: 'New nodejs Workflow ?',
    type: 'confirm',
    default: true,
  },
];
