export default {
  input: './lib-esm/index.js',
  output: {
    file: 'bin/bin.cjs',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
};
