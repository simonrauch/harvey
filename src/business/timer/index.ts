import { getAliasOrCreate } from '../alias';
import { HarveyConfig } from '../config';
import { HarveyError } from '../error';
import { getRunningTimeEntry, restartTimeEntry, saveTimeEntry, stopTimeEntry } from '../../service/api/harvest';
import { deleteFile, readFromJsonFile, writeToJsonFile } from '../../service/filesystem';
import { HarvestTimeEntry } from 'node-harvest-api';
import { printTimer } from '../../presentation/cli-output/timer';
import { roundTimeEntry } from '../round';

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
        const config = HarveyConfig.getConfig();
        writeToJsonFile(stoppedTimer, config.pausedTimerFilePath);
        resolve();
      });
    });
  });
}

export function resumePausedTimer(): Promise<void> {
  return new Promise((resolve) => {
    const config = HarveyConfig.getConfig();
    getRunningTimeEntry().then((activeTimer) => {
      const pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
      if (!activeTimer && !pausedTimer) {
        throw new HarveyError('No paused timer to resume available.');
      }
      if (activeTimer) {
        deleteFile(config.pausedTimerFilePath);
        resolve();
      }
      if (pausedTimer) {
        restartTimeEntry(pausedTimer).then(() => {
          deleteFile(config.pausedTimerFilePath);
          resolve();
        });
      }
    });
  });
}

export function startTimer(alias: string, date: string, note: string): Promise<void> {
  return new Promise((resolve) => {
    const config = HarveyConfig.getConfig();
    deleteFile(config.pausedTimerFilePath);
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
  date: string,
  note: string,
  addMinutes: number,
  subtractMinutes: number,
  round: boolean,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve) => {
    const hourDiff = getHourTimeDiff(addMinutes, subtractMinutes);
    const promises = [
      updateRunningTimer(date, note, hourDiff, round, roundingInterval),
      updatePausedTimer(date, note, hourDiff, round, roundingInterval),
    ];
    Promise.all(promises).then(() => {
      resolve();
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
  date: string,
  note: string,
  hourDiff: number,
  round: boolean,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimeEntry().then((activeTimer) => {
      if (activeTimer) {
        activeTimer.spent_date = date;
        activeTimer.notes = note;
        activeTimer = setHourTimeDiffOnTimeEntry(activeTimer, hourDiff);
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
  date: string,
  note: string,
  hourDiff: number,
  round: boolean,
  roundingInterval: number,
): Promise<void> {
  return new Promise((resolve) => {
    const config = HarveyConfig.getConfig();
    let pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
    if (pausedTimer) {
      pausedTimer.spent_date = date;
      pausedTimer.notes = note;
      pausedTimer = setHourTimeDiffOnTimeEntry(pausedTimer, hourDiff);
      if (round) {
        pausedTimer = roundTimeEntry(pausedTimer, roundingInterval);
      }
      saveTimeEntry(pausedTimer).then((updatedTimer) => {
        writeToJsonFile(updatedTimer, config.pausedTimerFilePath);
        resolve();
      });
    } else {
      resolve();
    }
  });
}
export function stopRunningTimer(round: boolean, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    const config = HarveyConfig.getConfig();
    getRunningTimeEntry().then((activeTimer) => {
      deleteFile(config.pausedTimerFilePath);
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
  const config = HarveyConfig.getConfig();
  return readFromJsonFile(config.pausedTimerFilePath);
}
