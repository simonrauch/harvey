import fs from 'fs';
import path from 'path';
import { transformPath } from '.';
import { Config } from '../../business/config';

export function configFileExists(filePath: string): boolean {
  filePath = transformPath(filePath);
  return fs.existsSync(filePath);
}
export function readConfigFile(filePath: string): Config {
  if (!configFileExists(filePath)) {
    throw new Error(`No config file found at ${filePath}. Please create one, by running the init command`);
  }
  filePath = transformPath(filePath);
  return JSON.parse(fs.readFileSync(filePath).toString());
}

export function writeConfigFile(config: Config, filePath: string): void {
  filePath = transformPath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
}
