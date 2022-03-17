import { fileExists, readFromJsonFile, writeToJsonFile } from '.';
import { Config } from '../../business/config';

export function readConfigFile(filePath: string): Config {
  if (!fileExists(filePath)) {
    throw new Error(`No config file found at "${filePath}". Please create one, by running the init command`);
  }
  return readFromJsonFile(filePath);
}

export function writeConfigFile(config: Config, filePath: string): void {
  writeToJsonFile(config, filePath);
}
