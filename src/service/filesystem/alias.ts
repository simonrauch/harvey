import fs from 'fs';
import path from 'path';
import { transformPath } from '.';
import { Alias } from '../../business/alias';
import { HarveyConfig } from '../../business/config';

export function readAliasFile(): Map<string, Alias> {
  let filePath = HarveyConfig.getConfig().aliasFilePath;
  if (!aliasFileExists()) {
    writeAliasFile(new Map());
  }
  filePath = transformPath(filePath);
  return new Map(JSON.parse(fs.readFileSync(filePath).toString()));
}

export function writeAliasFile(aliases: Map<string, Alias>): void {
  const filePath = transformPath(HarveyConfig.getConfig().aliasFilePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(Array.from(aliases.entries())), 'utf8');
}

function aliasFileExists(): boolean {
  const filePath = transformPath(HarveyConfig.getConfig().aliasFilePath);
  return fs.existsSync(filePath);
}
