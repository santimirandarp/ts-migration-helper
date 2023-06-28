import { execSync as exec } from 'child_process';
import { writeFile } from 'fs/promises';

import got from 'got';

export async function replaceWorkflow(path: string, webSource: string) {
  const data = await got(webSource).text();
  const r = exec("git branch --v | head -n 1 | awk '{print $1}'")
    .toString()
    .trim();

  await writeFile(path, data.replace('$default-branch', r), {
    encoding: 'utf-8',
  });
}
