import { HarveyConfig } from '../../business/config';
import Harvest from 'node-harvest-api';
import { HarveyError } from '../../business/error';
import {
  HarvestProjectAssignment,
  HarvestProjectTaskAssignment,
  HarvestTimeEntry,
  HarvestUser,
} from '../../business/harvest';

let projectTaskAssignmentCache: Array<HarvestProjectTaskAssignment> | null;
let projectAssignmentCache: Array<HarvestProjectAssignment> | null;
let authenticatedUserIdCache: number | null;
let harvestSdk: Harvest | null;

export function resetHarvestCache(): void {
  projectAssignmentCache = null;
  projectAssignmentCache = null;
  authenticatedUserIdCache = null;
  harvestSdk = null;
}

export function getHarvestSdk(): Harvest {
  if (!harvestSdk) {
    const config = HarveyConfig.getConfig();
    harvestSdk = new Harvest(config.accountId, config.accessToken, 'harvey');
  }

  return harvestSdk;
}

export async function bookTimeEntry(timeEntry: HarvestTimeEntry): Promise<void> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    harvest.time_entries.create(timeEntry).then(() => {
      resolve();
    });
  });
}

export async function getMyProjectAssignments(forceFetch = false): Promise<HarvestProjectAssignment[]> {
  return new Promise((resolve) => {
    if (projectAssignmentCache && !forceFetch) {
      resolve(projectAssignmentCache);
    }

    const harvest = getHarvestSdk();

    harvest.users
      .pipe('me')
      .project_assignments.all()
      .then((projectAssignments: HarvestProjectAssignment[]) => {
        projectAssignmentCache = projectAssignments;
        resolve(projectAssignmentCache);
      });
  });
}

export async function getMyProjectTaskAssignments(forceFetch = false): Promise<Array<HarvestProjectTaskAssignment>> {
  return new Promise((resolve) => {
    if (projectTaskAssignmentCache && !forceFetch) {
      resolve(projectTaskAssignmentCache);
    }
    getMyProjectAssignments(forceFetch).then((projectAssignments) => {
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

export async function getRunningTimeEntry(): Promise<HarvestTimeEntry | null> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    getAuthenticatedUserId().then((userId) => {
      harvest.time_entries.get({ is_running: true, user_id: userId }).then((timeEntries: HarvestTimeEntry[]) => {
        if (timeEntries.length > 1) {
          throw new HarveyError(
            'You somehow managed to start multiple time entries. Only one time entry should be running. Please stop them and restart only the correct one.',
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
export async function saveTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    if (timeEntry.id) {
      harvest.time_entries.update(timeEntry.id, timeEntry).then(resolve);
    } else {
      harvest.time_entries.create(timeEntry).then(resolve);
    }
  });
}

export async function stopTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    if (timeEntry.id) {
      harvest.time_entries.stop(timeEntry.id).then(resolve);
    } else {
      resolve(timeEntry);
    }
  });
}
export async function restartTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    if (timeEntry.id) {
      harvest.time_entries.restart(timeEntry.id).then(resolve);
    } else {
      resolve(timeEntry);
    }
  });
}
export async function getAuthenticatedUserId(): Promise<number> {
  return new Promise((resolve) => {
    if (authenticatedUserIdCache) {
      resolve(authenticatedUserIdCache);
    }
    const harvest = getHarvestSdk();
    harvest.users.me().then((user: HarvestUser) => {
      authenticatedUserIdCache = user.id;
      resolve(authenticatedUserIdCache);
    });
  });
}
export async function getMyTimeEntriesPerDate(date: string): Promise<HarvestTimeEntry[]> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    getAuthenticatedUserId().then((userId) => {
      harvest.time_entries.get({ from: date, to: date, user_id: userId }).then(resolve);
    });
  });
}
export async function deleteTimeEntry(timeEntry: HarvestTimeEntry): Promise<void> {
  return new Promise((resolve) => {
    const harvest = getHarvestSdk();
    if (!timeEntry.id) {
      throw new Error('id property has to be set, to delete a time entry.');
    }
    harvest.time_entries.delete(timeEntry.id).then(resolve);
  });
}
export async function isAccountIdAndTokenValid(accountId: string, token: string): Promise<boolean> {
  return new Promise((resolve) => {
    const harvest = new Harvest(accountId, token, 'harvey');
    harvest.users.me().then((user: HarvestUser) => {
      if (user.first_name) {
        resolve(true);
      }
      resolve(false);
    });
  });
}
