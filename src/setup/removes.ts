export const removes = {
  rollup: {
    npm: 'rollup',
    choice: {
      name: 'rollup',
      value: 'rollup',
      checked: true,
    },
  },
  eslint: {
    npm: 'rollup eslint-config-cheminfo',
    choice: {
      name: 'cheminfo-eslint',
      value: 'eslint',
      checked: true,
    },
  },
  babelrc: {
    file: '.babelrc',
    choice: {
      name: 'Babel',
      value: 'babelrc',
      checked: true,
    },
  },
  rollupConfig: {
    file: 'rollup.config.js',
    choice: {
      name: 'rollupConfig',
      value: 'rollupConfig',
      checked: true,
    },
  },
} as const;

export type RemovesKeys = keyof typeof removes;
