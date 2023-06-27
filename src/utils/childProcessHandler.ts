import { exec } from 'child_process';

type ChildProcessErrorHandling = Parameters<typeof exec>[2];

export const childProcessErrorHandling: ChildProcessErrorHandling =
  function childProcessErrorHandling(err, stdout) {
    if (err) {
      throw new Error(err.message);
    } else {
      console.log(stdout);
    }
  };
