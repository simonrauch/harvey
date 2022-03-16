import { getAliasOrCreate } from '../alias';
import { HarveyError } from '../error';
import { getRunningTimeEntry, restartTimeEntry, saveTimeEntry, stopTimeEntry } from '../../service/api/harvest';
import { printTimer } from '../../cli/cli-output/timer';
import { roundTimeEntry } from '../round';
import { readPausedTimer, storePausedTimer, deletePausedTimer } from '../../service/filesystem/timer';
import { HarvestTimeEntry } from '../harvest';

export enum HarveyTimerStatus {
  stopped,
  running,
  paused,
}
export interface HarveyTimer {
  timeEntry?: HarvestTimeEntry;
  status: HarveyTimerStatus;
}
export async function showTimer(): Promise<void> {
  return new Promise((resolve) => {
    const pausedTimer = getPausedTimer();
    getRunningTimeEntry().then((activeTimer) => {
      if (!pausedTimer && !activeTimer) {
        printTimer({ status: HarveyTimerStatus.stopped });
      } else if (activeTimer) {
        printTimer({ status: HarveyTimerStatus.running, timeEntry: activeTimer });
      } else if (pausedTimer) {
        printTimer({ status: HarveyTimerStatus.paused, timeEntry: pausedTimer });
      }
      resolve();
    });
  });
}

export async function pauseActiveTimer(): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimeEntry().then((activeTimer) => {
      if (!activeTimer) {
        throw new HarveyError('No active timer to pause.');
      }
      stopTimeEntry(activeTimer).then((stoppedTimer) => {
        storePausedTimer(stoppedTimer);
        resolve();
      });
    });
  });
}

export function resumePausedTimer(): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimeEntry().then((activeTimer) => {
      const pausedTimer = readPausedTimer();
      if (!activeTimer && !pausedTimer) {
        throw new HarveyError('No paused timer to resume available.');
      }
      if (activeTimer) {
        deletePausedTimer();
        resolve();
      }
      if (pausedTimer) {
        restartTimeEntry(pausedTimer).then(() => {
          deletePausedTimer();
          resolve();
        });
      }
    });
  });
}

export function startTimer(alias: string, date: string, note: string): Promise<void> {
  return new Promise((resolve) => {
    deletePausedTimer();
    getRunningTimeEntry().then((activeTimer) => {
      if (activeTimer) {
        throw new HarveyError('Timer already running. Please stop it, before starting a new one.');
      }
      getAliasOrCreate(alias).then((aliasEntry) => {
        saveTimeEntry({
          project_id: aliasEntry.idProject,
          task_id: aliasEntry.idTask,
          hours: 0,
          notes: note,
          spent_date: date,
          is_running: true,
        }).then(() => {
          resolve();
        });
      });
    });
  });
}

export function updateTimer(
  date: string | null,
  note: string | null,
  addMinutes: number | null,
  subtractMinutes: number | null,
  round: boolean | null,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const hourDiff = getHourTimeDiff(addMinutes ?? 0, subtractMinutes ?? 0);

    if (hourDiff !== 0 && round) {
      reject(new HarveyError('Rounding and adding/subtracting are exclusive timer actions. Please only use one.'));
      return;
    }

    const promises = [
      updateRunningTimer(date, note, hourDiff, round ?? false, roundingInterval),
      updatePausedTimer(date, note, hourDiff, round ?? false, roundingInterval),
    ];
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function getHourTimeDiff(addMinutes: number, subtractMinutes: number): number {
  const minuteDiff = addMinutes - subtractMinutes;
  return minuteDiff / 60;
}
function setHourTimeDiffOnTimeEntry(timeEntry: HarvestTimeEntry, hourDiff: number): HarvestTimeEntry {
  const newHours = timeEntry.hours + hourDiff;
  if (newHours < 0) {
    throw new HarveyError('Cannot set time entries new to time to a value below 0.');
  }
  if (newHours > 24) {
    throw new HarveyError('Cannot set time entries new to time to a value above 24h.');
  }
  timeEntry.hours = newHours;

  return timeEntry;
}
async function updateRunningTimer(
  date: string | null,
  note: string | null,
  hourDiff: number,
  round: boolean,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    getRunningTimeEntry().then((activeTimer) => {
      if (activeTimer) {
        if (date) activeTimer.spent_date = date;
        if (note) activeTimer.notes = note;
        try {
          activeTimer = setHourTimeDiffOnTimeEntry(activeTimer, hourDiff);
        } catch (error) {
          reject(error);
          return;
        }
        if (round) {
          activeTimer = roundTimeEntry(activeTimer, roundingInterval);
        }
        saveTimeEntry(activeTimer).then(() => resolve());
      } else {
        resolve();
      }
    });
  });
}
async function updatePausedTimer(
  date: string | null,
  note: string | null,
  hourDiff: number,
  round: boolean,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let pausedTimer = readPausedTimer();
    if (pausedTimer) {
      if (date) pausedTimer.spent_date = date;
      if (note) pausedTimer.notes = note;
      if (round) {
        pausedTimer = roundTimeEntry(pausedTimer, roundingInterval);
      }
      try {
        pausedTimer = setHourTimeDiffOnTimeEntry(pausedTimer, hourDiff);
      } catch (error) {
        reject(error);
        return;
      }
      saveTimeEntry(pausedTimer).then((updatedTimer) => {
        storePausedTimer(updatedTimer);
        resolve();
      });
    } else {
      resolve();
    }
  });
}
export function stopRunningTimer(round: boolean, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimeEntry().then((activeTimer) => {
      deletePausedTimer();
      if (activeTimer) {
        stopTimeEntry(activeTimer).then((stoppedTimer) => {
          if (round) {
            stoppedTimer = roundTimeEntry(stoppedTimer, roundingInterval);
            saveTimeEntry(stoppedTimer).then(() => resolve());
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

function getPausedTimer(): HarvestTimeEntry | null {
  return readPausedTimer();
}
