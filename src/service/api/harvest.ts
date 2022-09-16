import { HarveyConfig } from '../../business/config';
import { HarveyError } from '../../business/error';
import axios from 'axios';
import { HarvestProjectAssignment, HarvestProjectTaskAssignment, HarvestTimeEntry } from '../../business/harvest';

let projectTaskAssignmentCache: Array<HarvestProjectTaskAssignment> | null;
let projectAssignmentCache: Array<HarvestProjectAssignment> | null;
let authenticatedUserIdCache: number | null;

export function resetHarvestCache(): void {
  projectTaskAssignmentCache = null;
  projectAssignmentCache = null;
  authenticatedUserIdCache = null;
}

function getRequestHeaders(): object {
  const config = HarveyConfig.getConfig();
  return {
    'Harvest-Account-Id': config.accountId,
    Authorization: `Bearer ${config.accessToken}`,
    'User-Agent': 'Harvey',
  };
}

function getAxiosRequestConfig(): object {
  return {
    headers: getRequestHeaders(),
  };
}

function getBaseUrl(): string {
  let harvestSubdomain;

  try {
    harvestSubdomain = HarveyConfig.getConfig().harvestSubdomain;
  } catch (error) {
    harvestSubdomain = 'api';
  }

  return `https://${harvestSubdomain}.harvestapp.com/api/v2`;
}

export async function getMyProjectAssignments(forceFetch = false): Promise<HarvestProjectAssignment[]> {
  return new Promise((resolve, reject) => {
    if (projectAssignmentCache && !forceFetch) {
      resolve(projectAssignmentCache);
      return;
    }
    axios
      .get(getBaseUrl() + '/users/me/project_assignments', getAxiosRequestConfig())
      .then((res) => {
        projectAssignmentCache = res.data.project_assignments;
        resolve(res.data.project_assignments);
      })
      .catch(reject);
  });
}

export async function getMyProjectTaskAssignments(forceFetch = false): Promise<Array<HarvestProjectTaskAssignment>> {
  return new Promise((resolve) => {
    if (projectTaskAssignmentCache && !forceFetch) {
      resolve(projectTaskAssignmentCache);
      return;
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
  return new Promise((resolve, reject) => {
    getAuthenticatedUserId().then((userId) => {
      axios
        .get(getBaseUrl() + '/time_entries', {
          params: { is_running: true, user_id: userId },
          ...getAxiosRequestConfig(),
        })
        .then((res) => {
          if (res.data.time_entries.length > 1) {
            reject(
              new HarveyError(
                'You somehow managed to start multiple time entries. Only one time entry should be running. Please stop them and restart only the correct one.',
              ),
            );
            return;
          }
          if (res.data.time_entries[0]) {
            resolve(res.data.time_entries[0]);
          }
          resolve(null);
        })
        .catch(reject);
    });
  });
}

export async function saveTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve, reject) => {
    if (timeEntry.id) {
      axios
        .patch(getBaseUrl() + '/time_entries/' + timeEntry.id, timeEntry, getAxiosRequestConfig())
        .then((res) => {
          resolve(res.data);
        })
        .catch(reject);
    } else {
      axios
        .post(getBaseUrl() + '/time_entries', timeEntry, getAxiosRequestConfig())
        .then((res) => {
          resolve(res.data);
        })
        .catch(reject);
    }
  });
}

export async function stopTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve, reject) => {
    if (!timeEntry.id) {
      reject(new Error('id property has to be set, to stop a time entry.'));
      return;
    }
    axios
      .patch(getBaseUrl() + '/time_entries/' + timeEntry.id + '/stop', {}, getAxiosRequestConfig())
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

export async function restartTimeEntry(timeEntry: HarvestTimeEntry): Promise<HarvestTimeEntry> {
  return new Promise((resolve, reject) => {
    if (!timeEntry.id) {
      reject(new Error('id property has to be set, to restart a time entry.'));
      return;
    }
    axios
      .patch(getBaseUrl() + '/time_entries/' + timeEntry.id + '/restart', {}, getAxiosRequestConfig())
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

export async function getAuthenticatedUserId(forceFetch = false): Promise<number> {
  return new Promise((resolve, reject) => {
    if (authenticatedUserIdCache && !forceFetch) {
      resolve(authenticatedUserIdCache);
      return;
    }
    axios
      .get(getBaseUrl() + '/users/me', getAxiosRequestConfig())
      .then((res) => {
        authenticatedUserIdCache = res.data.id;
        resolve(res.data.id);
      })
      .catch(reject);
  });
}

export async function getMyTimeEntriesPerDate(date: string): Promise<HarvestTimeEntry[]> {
  return new Promise((resolve, reject) => {
    getAuthenticatedUserId().then((userId) => {
      axios
        .get(getBaseUrl() + '/time_entries', {
          params: { from: date, to: date, user_id: userId },
          ...getAxiosRequestConfig(),
        })
        .then((res) => {
          resolve(res.data.time_entries);
        })
        .catch(reject);
    });
  });
}

export async function deleteTimeEntry(timeEntry: HarvestTimeEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!timeEntry.id) {
      reject(new Error('id property has to be set, to delete a time entry.'));
      return;
    }
    axios
      .delete(getBaseUrl() + '/time_entries/' + timeEntry.id, getAxiosRequestConfig())
      .then(() => resolve())
      .catch(reject);
  });
}

export async function isAccountIdAndTokenValid(accountId: string, token: string): Promise<boolean> {
  return new Promise((resolve) => {
    axios
      .get(getBaseUrl() + '/users/me', {
        headers: {
          'Harvest-Account-Id': accountId,
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Harvey',
        },
      })
      .then((res) => {
        if (res.data.first_name) {
          resolve(true);
          return;
        }
        resolve(false);
        return;
      })
      .catch(() => {
        resolve(false);
        return;
      });
  });
}
