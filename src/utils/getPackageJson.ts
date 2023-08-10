import { existsSync } from 'node:fs';

export function getPackageJson() {
  if (!existsSync('package.json')) {
    console.error(
      '\npackage.json not found. Run this program in the project root.',
    );
    process.exit(1);
  }
}
