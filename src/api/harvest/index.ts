import type { Config } from '../../business/config';
import Harvest from 'node-harvest-api';
import { HarveyError } from '../../business/error';

let projectTaskAssignmentCache: Array<HarvestProjectTaskAssignment>;
let projectAssignmentCache: Array<HarvestProjectAssignment>;
let authenticatedUserIdCache: number;
let harvestSdk: Harvest;

export function getHarvestSdk(config: Config): Harvest {
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

export async function getMyProjectAssignments(config: Config, forceFetch = false): Promise<HarvestProjectAssignment[]> {
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
  return new Promise((resolve) => {
    if (projectTaskAssignmentCache && !forceFetch) {
      resolve(projectTaskAssignmentCache);
    }
    getMyProjectAssignments(config, forceFetch).then((projectAssignments) => {
      const projectTaskAssignments: HarvestProjectTaskAssignment[] = [];
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
  });
}

export async function getRunningTimer(config: Config): Promise<HarvestTimeEntry | null> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    getAuthenticatedUserId(config).then((userId) => {
      harvest.time_entries.get({ is_running: true, user_id: userId }).then((timeEntries: HarvestTimeEntry[]) => {
        if (timeEntries.length > 1) {
          throw new HarveyError(
            'You somehow managed to start multiple timers. Only one timer should be running. Please stop them and restart only the correct one.',
          );
        }
        if (timeEntries[0]) {
          resolve(timeEntries[0]);
        }
        resolve(null);
      });
    });
  });
}
export async function saveTimer(timer: HarvestTimeEntry, config: Config): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    if (timer.id) {
      harvest.time_entries.update(timer.id, timer).then(resolve);
    } else {
      harvest.time_entries.create(timer).then(resolve);
    }
  });
}

export async function stopTimer(timer: HarvestTimeEntry, config: Config): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    if (timer.id) {
      harvest.time_entries.stop(timer.id).then(resolve);
    } else {
      resolve(timer);
    }
  });
}
export async function restartTimer(timer: HarvestTimeEntry, config: Config): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    if (timer.id) {
      harvest.time_entries.restart(timer.id).then(resolve);
    } else {
      resolve(timer);
    }
  });
}
export async function getAuthenticatedUserId(config: Config): Promise<number> {
  return new Promise((resolve) => {
    if (authenticatedUserIdCache) {
      resolve(authenticatedUserIdCache);
    }
    const harvest = getHarvestSdk(config);
    harvest.users.me().then((user: HarvestUser) => {
      authenticatedUserIdCache = user.id;
      resolve(authenticatedUserIdCache);
    });
  });
}
export async function getMyTimeEntriesPerDate(date: string, config: Config): Promise<HarvestTimeEntry[]> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    getAuthenticatedUserId(config).then((userId) => {
      harvest.time_entries.get({ from: date, to: date, user_id: userId }).then(resolve);
    });
  });
}
export async function deleteTimeEntry(timeEntry: HarvestTimeEntry, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk(config);
    if (!timeEntry.id) {
      throw new Error('id property has to be set, to delete a time entry.');
    }
    harvest.time_entries.delete(timeEntry.id).then(resolve);
  });
}
