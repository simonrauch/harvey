import { homedir } from 'os';
import fs from 'fs';
import path from 'path';
import { createInterface as createReadlineInterface } from 'readline';
import type { Config } from '../config';
import { getAllProjectTaskAssignments } from '../harvest';
import { HarveyError } from '../error';

export interface Alias {
  alias: string;
  idProject: number;
  idTask: number;
}

class AliasNotFoundError extends HarveyError {}

export async function addAlias(aliasKey: string, config: Config, aliasFilePath: string): Promise<Alias> {
  return new Promise(async (resolve) => {
    const projectTaskAssignments = await getAllProjectTaskAssignments(config);
    const filteredProjectTaskAssignments = projectTaskAssignments.filter(
      (projectTaskAssignment: HarvestProjectTaskAssignment) => {
        return projectTaskAssignment.task.name.includes(aliasKey);
      },
    );

    if (filteredProjectTaskAssignments.length === 0) {
      throw new Error(`Task "${aliasKey}" was not found.`);
    }

    if (filteredProjectTaskAssignments.length > 10) {
      throw new Error(`Too many tasks for "${aliasKey}" were found. Please use a more specific alias.`);
    }

    const projectTaskAssignment = await findSingleProjectTaskAssignment(aliasKey, filteredProjectTaskAssignments);
    const alias = mapProjectTaskAssignmentToAlias(aliasKey, projectTaskAssignment);

    storeAlias(alias, aliasFilePath);

    resolve(alias);
  });
}

export async function bulkGetAliasesOrCreate(
  aliasKeys: Array<string>,
  config: Config,
  aliasFilePath: string,
): Promise<Map<string, Alias>> {
  return new Promise(async (resolve) => {
    const resultAliases: Map<string, Alias> = new Map();

    for (const aliasKey of aliasKeys) {
      resultAliases.set(aliasKey, await getAliasOrCreate(aliasKey, config, aliasFilePath));
    }

    resolve(resultAliases);
  });
}

export async function getAliasOrCreate(aliasKey: string, config: Config, aliasFilePath: string): Promise<Alias> {
  return new Promise(async (resolve) => {
    try {
      const alias = getAlias(aliasKey, aliasFilePath);
      resolve(alias);
    } catch (error) {
      if (!(error instanceof AliasNotFoundError)) {
        throw error;
      }
      const alias = await addAlias(aliasKey, config, aliasFilePath);
      resolve(alias);
    }
  });
}

export function getAlias(aliasKey: string, aliasFilePath: string): Alias {
  const alias = readAliasFile(aliasFilePath).get(aliasKey);

  if (!alias) {
    throw new AliasNotFoundError();
  }

  return alias;
}

export function removeAlias(aliasKey: string, aliasFilePath: string): void {
  const aliases = readAliasFile(aliasFilePath);

  if (!aliases.has(aliasKey)) {
    throw new Error(`"${aliasKey}" was not found. Nothing to remove.`);
  }

  aliases.delete(aliasKey);

  writeAliasFile(aliases, aliasFilePath);
}

export function removeAllAliases(aliasFilePath: string): void {
  writeAliasFile(new Map(), aliasFilePath);
}

async function findSingleProjectTaskAssignment(
  aliasKey: string,
  projectTaskAssignments: Array<HarvestProjectTaskAssignment>,
): Promise<HarvestProjectTaskAssignment> {
  return new Promise((resolve) => {
    if (projectTaskAssignments.length == 1) {
      resolve(projectTaskAssignments[0]);
      return;
    }

    process.stdout.write(`Multiple tasks for "${aliasKey}" were found: \n`);

    const rl = createReadlineInterface({
      input: process.stdin,
      output: process.stdout,
    });

    projectTaskAssignments.forEach((projectTaskAssignment, index) => {
      process.stdout.write(`${index} - ${projectTaskAssignment.task.name} (${projectTaskAssignment.project.name}) \n`);
    });

    rl.question('Please choose one of the follwing, by entering the number: ', function (numberEntered: string) {
      const index = Number(numberEntered);

      if (isNaN(index)) {
        throw new Error(`${index} is not a number.`);
      }

      if (!projectTaskAssignments[index]) {
        throw new Error(`${index} is not a valid option.`);
      }

      rl.close();
      resolve(projectTaskAssignments[index]);
    });
  });
}

function mapProjectTaskAssignmentToAlias(aliasKey: string, projectTaskAssignment: HarvestProjectTaskAssignment): Alias {
  return {
    alias: aliasKey,
    idProject: projectTaskAssignment.project.id,
    idTask: projectTaskAssignment.task.id,
  };
}

function storeAlias(alias: Alias, aliasFilePath: string): void {
  const aliases = readAliasFile(aliasFilePath);
  aliases.set(alias.alias, alias);
  writeAliasFile(aliases, aliasFilePath);
}

function readAliasFile(filePath: string): Map<string, Alias> {
  if (!aliasFileExists(filePath)) {
    writeAliasFile(new Map(), filePath);
  }
  filePath = transformPath(filePath);
  return new Map(JSON.parse(fs.readFileSync(filePath).toString()));
}

function writeAliasFile(aliases: Map<string, Alias>, filePath: string): void {
  filePath = transformPath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(Array.from(aliases.entries())), 'utf8');
}

function aliasFileExists(filePath: string): boolean {
  filePath = transformPath(filePath);
  return fs.existsSync(filePath);
}

function transformPath(path: string): string {
  return path.replace('~', homedir());
}
