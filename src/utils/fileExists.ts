import { statSync as stat } from 'node:fs';

export function fileExists(path: string) {
  try {
    stat(path);
    return true;
  } catch (e) {
    return false;
  }
}
