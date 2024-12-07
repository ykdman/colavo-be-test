import * as fs from 'fs';
import * as path from 'path';

export function loadJson<T>(filePath: string): T {
  const fullPath = path.resolve(__dirname, filePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}
