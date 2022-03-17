import { fileExists, readFromJsonFile, transformPath, writeToJsonFile } from '.';
import { Alias } from '../../business/alias';
import { HarveyConfig } from '../../business/config';

export function readAliasFile(): Map<string, Alias> {
  const filePath = HarveyConfig.getConfig().aliasFilePath;
  if (!fileExists(filePath)) {
    writeAliasFile(new Map());
  }
  return new Map(readFromJsonFile(filePath));
}

export function writeAliasFile(aliases: Map<string, Alias>): void {
  const filePath = transformPath(HarveyConfig.getConfig().aliasFilePath);
  writeToJsonFile(Array.from(aliases.entries()), filePath);
}
