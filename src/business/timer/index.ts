import { getAliasOrCreate } from '../alias';
import { Config } from '../config';
import { HarveyError } from '../error';
import { getRunningTimer, restartTimer, saveTimer, stopTimer } from '../../api/harvest';
import { deleteFile, formatTimerHours, readFromJsonFile, writeToJsonFile } from '../helper';
import Table from 'cli-table';

export async function printTimerStatus(config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const pausedTimer = getPausedTimer(config);
    const activeTimer = await getRunningTimer(config);
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
}

export async function pauseActiveTimer(config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const activeTimer = await getRunningTimer(config);
    if (!activeTimer) {
      throw new HarveyError('No active timer to pause.');
    }
    const stoppedTimer = await stopTimer(activeTimer, config);
    writeToJsonFile(stoppedTimer, config.pausedTimerFilePath);
    resolve();
  });
}

export function resumePausedTimer(config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const activeTimer = await getRunningTimer(config);
    const pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
    if (!activeTimer && !pausedTimer) {
      throw new HarveyError('No paused timer to resume available.');
    }
    if (activeTimer) {
      deleteFile(config.pausedTimerFilePath);
      resolve();
    }
    if (pausedTimer) {
      await restartTimer(pausedTimer, config);
      deleteFile(config.pausedTimerFilePath);
      resolve();
    }
  });
}

export function startTimer(alias: string, date: string, note: string, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    deleteFile(config.pausedTimerFilePath);
    const activeTimer = await getRunningTimer(config);
    if (activeTimer) {
      throw new HarveyError('Timer already running. Please stop it, before starting a new one.');
    }
    const aliasEntry = await getAliasOrCreate(alias, config);
    await saveTimer(
      {
        project_id: aliasEntry.idProject,
        task_id: aliasEntry.idTask,
        hours: 0,
        notes: note,
        spent_date: date,
        is_running: true,
      },
      config,
    );
    resolve();
  });
}

export function updateTimer(date: string, note: string, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const activeTimer = await getRunningTimer(config);
    if (activeTimer) {
      activeTimer.spent_date = date;
      activeTimer.notes = note;
      await saveTimer(activeTimer, config);
    }
    const pausedTimer = readFromJsonFile(config.pausedTimerFilePath);
    if (pausedTimer) {
      pausedTimer.spent_date = date;
      pausedTimer.notes = note;
      const updatedTimer = await saveTimer(pausedTimer, config);
      writeToJsonFile(updatedTimer, config.pausedTimerFilePath);
    }
    resolve();
  });
}
export function stopRunningTimer(config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const activeTimer = await getRunningTimer(config);
    if (activeTimer) {
      await stopTimer(activeTimer, config);
    }
    deleteFile(config.pausedTimerFilePath);
    resolve();
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
