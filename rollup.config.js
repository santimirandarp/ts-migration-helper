import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './lib-esm/index.js',
  output: {
    file: 'bin/index.js',
    format: 'esm',
    banner: '#!/usr/bin/env node',
  },
  plugins: [nodeResolve() /*commonjs(),  pluginJson()*/],
  external: [
    'chalk',
    'yaml',
    'inquirer',
    'fs',
    'path',
    'child_process',
    'util',
    'got',
  ],
};
