import * as fs from 'fs';
import * as path from 'path';

export function loadJson<T>(filePath: string): T {
  const fullPath = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}
