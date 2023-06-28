import { readFile } from 'fs/promises';

export async function getPackageJson() {
  const json = await readFile('./package.json', 'utf8');
  return JSON.parse(json);
}
