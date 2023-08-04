export default {
  input: './lib-esm/index.js',
  output: {
    file: 'bin/index.js',
    format: 'esm',
    banner: '#!/usr/bin/env node',
  },
  external: ['node_modules/'],
};
