export const installs = {
  ts: {
    command: 'typescript',
    choice: {
      name: 'TypeScript',
      value: 'ts',
      checked: true,
    },
  },
  eslint: {
    command: 'eslint-config-cheminfo-typescript',
    choice: {
      name: 'cheminfo-eslint',
      value: 'eslint',
      checked: true,
    },
  },
  babel: {
    command:
      '@babel/preset-typescript @babel/plugin-transform-modules-commonjs',
    choice: {
      name: 'Babel',
      value: 'babel',
      checked: true,
    },
  },
  jest: {
    command: '@types/jest',
    choice: {
      name: 'Jest',
      value: 'jest',
      checked: true,
    },
  },
  rimraf: {
    command: 'rimraf',
    choice: {
      name: 'Rimraf',
      value: 'rimraf',
      checked: true,
    },
  },
} as const;

export type InstallNames = keyof typeof installs;
