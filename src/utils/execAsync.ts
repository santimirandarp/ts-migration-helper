import { exec } from 'node:child_process';

export async function execAsync(command: string): Promise<string | Error> {
  return new Promise(function ex(resolve, reject) {
    exec(command, (error, stdout) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(stdout);
      }
    });
  });
}
