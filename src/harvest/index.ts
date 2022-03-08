import type { Config } from '../config';
import Harvest from 'node-harvest-api';

let projectTaskAssignmentCache: Array<HarvestProjectTaskAssignment>;
let projectAssignmentCache: Array<HarvestProjectAssignment>;
let harvestSdk: any;

export function getHarvestSdk(config: Config): any {
  if (!harvestSdk) {
    harvestSdk = new Harvest(config.accountId, config.accessToken, 'harvey');
  }

  return harvestSdk;
}

export async function bookTimeEntry(timeEntry: HarvestTimeEntry, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    harvest.time_entries.create(timeEntry).then(() => {
      resolve();
    });
  });
}

export async function getMyProjectAssignments(
  config: Config,
  forceFetch: boolean = false,
): Promise<HarvestProjectAssignment[]> {
  return new Promise((resolve) => {
    if (projectAssignmentCache && !forceFetch) {
      resolve(projectAssignmentCache);
    }

    const harvest = getHarvestSdk(config);

    harvest.users
      .pipe('me')
      .project_assignments.all()
      .then((projectAssignments: HarvestProjectAssignment[]) => {
        projectAssignmentCache = projectAssignments;
        resolve(projectAssignmentCache);
      });
  });
}

export async function getMyProjectTaskAssignments(
  config: Config,
  forceFetch = false,
): Promise<Array<HarvestProjectTaskAssignment>> {
  return new Promise(async (resolve) => {
    if (projectTaskAssignmentCache && !forceFetch) {
      resolve(projectTaskAssignmentCache);
    }
    const projectAssignments = await getMyProjectAssignments(config, forceFetch);
    let projectTaskAssignments: HarvestProjectTaskAssignment[] = [];
    for (const projectAssignment of projectAssignments) {
      for (const taskAssignments of projectAssignment.task_assignments) {
        projectTaskAssignments.push({
          project: projectAssignment.project,
          task: taskAssignments.task,
        });
      }
    }
    projectTaskAssignmentCache = projectTaskAssignments;
    resolve(projectTaskAssignmentCache);
  });
}
