import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

export function transformPath(filePath: string): string {
  return filePath.replace('~', homedir());
}

export function fileExists(filePath: string): boolean {
  filePath = transformPath(filePath);
  return fs.existsSync(filePath);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readFromJsonFile(filePath: string): any {
  if (!fileExists(filePath)) {
    return null;
  }

  filePath = transformPath(filePath);
  return JSON.parse(fs.readFileSync(filePath).toString());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeToJsonFile(content: any, filePath: string, pretty = false): void {
  filePath = transformPath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(content, null, pretty ? 2 : undefined), 'utf8');
}

export function deleteFile(filePath: string): void {
  filePath = transformPath(filePath);
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
  }
}
