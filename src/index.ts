#!/usr/bin/env node
import { run } from './run.js';

run()
  .then(() => console.log('done'))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
