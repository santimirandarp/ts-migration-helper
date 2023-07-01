import { writeFile } from 'fs/promises';

/**
 * Asynchronously updates the .gitignore file to ensure that 'lib' and 'lib-esm' are present.
 *
 * @param fileContents - The current contents of the .gitignore file as a string.
 * @returns - A Promise that fulfills with undefined when the updated .gitignore file has been written to disk.
 *
 */
export async function updateGitignore(fileContents: string) {
  const gitignore = fileContents.split('\n');
  const present = [];
  for (const line of gitignore) {
    if (line === 'lib') present.push('lib');
    else if (line === 'lib-esm') present.push('lib-esm');
  }

  if (!present.includes('lib')) {
    gitignore.push('lib');
  }
  if (!present.includes('lib-esm')) {
    gitignore.push('lib-esm');
  }

  return writeFile('.gitignore', gitignore.join('\n').concat('\n'));
}
