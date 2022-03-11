import { getAliasOrCreate } from '../alias';
import { Config } from '../config';
import { HarveyError } from '../error';
import { getRunningTimer, restartTimer, saveTimer, stopTimer } from '../../api/harvest';
import { deleteFile, formatTimerHours, readFromJsonFile, writeToJsonFile } from '../helper';
import Table from 'cli-table';

export async function printTimerStatus(config: Config): Promise<void> {
  return new Promise((resolve) => {
    const pausedTimer = getPausedTimer(config);
    getRunningTimer(config).then((activeTimer) => {
      if (!pausedTimer && !activeTimer) {
        process.stdout.write(formatTimeEntry('STOPPED'));
      }

      if (activeTimer) {
        process.stdout.write(formatTimeEntry('RUNNING', activeTimer));
      }

      if (pausedTimer) {
        process.stdout.write(formatTimeEntry('PAUSED', pausedTimer));
      }

      resolve();
    });
  });
}

export async function pauseActiveTimer(config: Config): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimer(config).then((activeTimer) => {
      if (!activeTimer) {
        throw new HarveyError('No active timer to pause.');
      }
      stopTimer(activeTimer, config).then((stoppedTimer) => {
        writeToJsonFile(stoppedTimer, config.pausedTimerFilePath);
        resolve();
      });
    });
  });
}

export function resumePausedTimer(config: Config): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimer(config).then((activeTimer) => {
      const pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
      if (!activeTimer && !pausedTimer) {
        throw new HarveyError('No paused timer to resume available.');
      }
      if (activeTimer) {
        deleteFile(config.pausedTimerFilePath);
        resolve();
      }
      if (pausedTimer) {
        restartTimer(pausedTimer, config).then(() => {
          deleteFile(config.pausedTimerFilePath);
          resolve();
        });
      }
    });
  });
}

export function startTimer(alias: string, date: string, note: string, config: Config): Promise<void> {
  return new Promise((resolve) => {
    deleteFile(config.pausedTimerFilePath);
    getRunningTimer(config).then((activeTimer) => {
      if (activeTimer) {
        throw new HarveyError('Timer already running. Please stop it, before starting a new one.');
      }
      getAliasOrCreate(alias, config).then((aliasEntry) => {
        saveTimer(
          {
            project_id: aliasEntry.idProject,
            task_id: aliasEntry.idTask,
            hours: 0,
            notes: note,
            spent_date: date,
            is_running: true,
          },
          config,
        ).then(() => {
          resolve();
        });
      });
    });
  });
}

export function updateTimer(date: string, note: string, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const promises = [updateRunningTimer(date, note, config), updatePausedTimer(date, note, config)];
    Promise.all(promises).then(() => resolve());
  });
}
async function updateRunningTimer(date: string, note: string, config: Config): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimer(config).then((activeTimer) => {
      if (activeTimer) {
        activeTimer.spent_date = date;
        activeTimer.notes = note;
        saveTimer(activeTimer, config).then(() => resolve());
      }
    });
  });
}
async function updatePausedTimer(date: string, note: string, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
    if (pausedTimer) {
      pausedTimer.spent_date = date;
      pausedTimer.notes = note;
      saveTimer(pausedTimer, config).then((updatedTimer) => writeToJsonFile(updatedTimer, config.pausedTimerFilePath));
    } else {
      resolve();
    }
  });
}
export function stopRunningTimer(config: Config): Promise<void> {
  return new Promise((resolve) => {
    getRunningTimer(config).then((activeTimer) => {
      deleteFile(config.pausedTimerFilePath);
      if (activeTimer) {
        stopTimer(activeTimer, config).then(() => resolve());
      } else {
        resolve();
      }
    });
  });
}

function formatTimeEntry(status: string, timeEntry?: HarvestTimeEntry): string {
  let tableHead: string[] = ['Status'];
  let colWidth: number[] = [9];
  let tableRow: string[] = [status];
  if (timeEntry && timeEntry.task) {
    tableHead = tableHead.concat(['Task', 'Notes', 'Timer']);
    colWidth = colWidth.concat([44, 20, 7]);
    tableRow = tableRow.concat([timeEntry.task.name, (timeEntry.notes ??= ''), formatTimerHours(timeEntry.hours)]);
  }

  const table = new Table({
    head: tableHead,
    colWidths: colWidth,
  });
  table.push(tableRow);
  return table.toString() + '\n';
}

function getPausedTimer(config: Config): HarvestTimeEntry | null {
  return readFromJsonFile(config.pausedTimerFilePath);
}
