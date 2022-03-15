import { getMyProjectTaskAssignments } from '../../service/api/harvest';
import { HarveyError } from '../error';
import { HarvestProjectTaskAssignment } from 'node-harvest-api';
import { readAliasFile, writeAliasFile } from '../../service/filesystem/alias';
import { askToChooseTaskProjectAssignmentForAliasing } from '../../presentation/user-input/alias';

export interface Alias {
  alias: string;
  idProject: number;
  idTask: number;
}

class AliasNotFoundError extends HarveyError {}

export async function addAlias(aliasKey: string, searchString?: string): Promise<Alias> {
  return new Promise((resolve) => {
    const aliasSearchTerm = searchString ?? aliasKey;
    getMyProjectTaskAssignments().then((projectTaskAssignments) => {
      const filteredProjectTaskAssignments = projectTaskAssignments.filter(
        (projectTaskAssignment: HarvestProjectTaskAssignment) => {
          return projectTaskAssignment.task.name.includes(aliasSearchTerm);
        },
      );

      if (filteredProjectTaskAssignments.length === 0) {
        throw new Error(`Task "${searchString}" was not found.`);
      }

      if (filteredProjectTaskAssignments.length > 10) {
        throw new Error(`Too many tasks for "${searchString}" were found. Please use a more specific alias.`);
      }

      findSingleProjectTaskAssignment(aliasKey, filteredProjectTaskAssignments).then((projectTaskAssignment) => {
        const alias = mapProjectTaskAssignmentToAlias(aliasKey, projectTaskAssignment);
        storeAlias(alias);
        resolve(alias);
      });
    });
  });
}

export async function getAliasOrCreate(aliasKey: string): Promise<Alias> {
  return new Promise((resolve) => {
    try {
      const alias = getAlias(aliasKey);
      resolve(alias);
    } catch (error) {
      if (!(error instanceof AliasNotFoundError)) {
        throw error;
      }
      addAlias(aliasKey).then(resolve);
    }
  });
}

export function getAlias(aliasKey: string): Alias {
  const alias = readAliasFile().get(aliasKey);

  if (!alias) {
    throw new AliasNotFoundError();
  }

  return alias;
}

export function removeAlias(aliasKey: string): void {
  const aliases = readAliasFile();

  if (!aliases.has(aliasKey)) {
    throw new Error(`"${aliasKey}" was not found. Nothing to remove.`);
  }

  aliases.delete(aliasKey);

  writeAliasFile(aliases);
}

export function removeAllAliases(): void {
  writeAliasFile(new Map());
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
    projectTaskAssignments.forEach((projectTaskAssignment, index) => {
      process.stdout.write(`${index} - ${projectTaskAssignment.task.name} (${projectTaskAssignment.project.name}) \n`);
    });
    askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
  });
}

function mapProjectTaskAssignmentToAlias(aliasKey: string, projectTaskAssignment: HarvestProjectTaskAssignment): Alias {
  return {
    alias: aliasKey,
    idProject: projectTaskAssignment.project.id,
    idTask: projectTaskAssignment.task.id,
  };
}

function storeAlias(alias: Alias): void {
  const aliases = readAliasFile();
  aliases.set(alias.alias, alias);
  writeAliasFile(aliases);
}
