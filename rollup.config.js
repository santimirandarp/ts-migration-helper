// import { nodeResolve } from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
// import pluginJson from '@rollup/plugin-json';

export default {
  input: './lib-esm/index.js',
  output: {
    file: 'bin/index.js',
    format: 'esm',
    banner: '#!/usr/bin/env node',
  },
  // plugins: [nodeResolve(), commonjs(), pluginJson()],
  external: ['node_modules/'],
};
