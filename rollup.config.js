export default {
    // use glob in the input
    input: ['lib-esm/questions.js', 'lib-esm/rename.js'],
    output: {
      format: 'esm',
      dir: 'bin',
      banner:'#!/usr/bin/env node',
    },
    exclude: 'node_modules'
};