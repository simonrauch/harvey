import { Config } from '../config';
import { getMyTimeEntriesPerDate, saveTimer as saveTimeEntry } from '../harvest';
import Table from 'cli-table';
import { formatTimerHours } from '../helper';
import { createInterface as createReadlineInterface } from 'readline';
import { HarveyError } from '../error';

export async function printDay(date: string, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const timeEntries = await getMyTimeEntriesPerDate(date, config);
    printTimeEntryTable(timeEntries);
    resolve();
  });
}
function printTimeEntryTable(timeEntries: HarvestTimeEntry[]): void {
  let totalTime = 0;
  const table = new Table({
    head: ['ID', 'Task', 'Notes', 'Time'],
    colWidths: [4, 49, 20, 7],
  });

  timeEntries.forEach((timeEntry, index) => {
    totalTime += timeEntry.hours;
    table.push([index, timeEntry.task?.name ?? '', timeEntry.notes ?? '', formatTimerHours(timeEntry.hours)]);
  });
  process.stdout.write(table.toString() + '\n');
  process.stdout.write(
    ' Sum:                                                                         ' +
      formatTimerHours(totalTime) +
      '\n\n',
  );
}

export async function roundDay(date: string, roundingIncrement: number, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const timeEntries = await getMyTimeEntriesPerDate(date, config);
    let updatePromises: Promise<HarvestTimeEntry>[] = [];
    timeEntries.forEach((timeEntry) => {
      const minutes = timeEntry.hours * 60;
      timeEntry.hours = (Math.ceil(minutes / roundingIncrement) * roundingIncrement) / 60;
      updatePromises.push(saveTimeEntry(timeEntry, config));
    });
    Promise.all(updatePromises).then(() => resolve());
  });
}
export async function modifyDay(date: string, roundingIncrement: number, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const timeEntries = await getMyTimeEntriesPerDate(date, config);
    printTimeEntryTable(timeEntries);
    const timeEntry = await chooseModifyTimeEntry(timeEntries);
    await modifyTimeEntry(timeEntry, roundingIncrement, config);
    resolve();
  });
}

async function modifyTimeEntry(timeEntry: HarvestTimeEntry, roundingIncrement: number, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'What do you want to modify? (Options: t - time, n - notes, r - round, d - delete): ',
      async (modifyAction: string) => {
        rl.close();
        modifyAction = modifyAction.trim().toLowerCase();
        if (modifyAction == 't' || modifyAction == 'time') {
          await setNewTimeEntryTime(timeEntry, config);
          resolve();
        } else if (modifyAction == 'n' || modifyAction == 'notes') {
          //TODO
          throw new HarveyError('Changing notes is not yet implemented.');
          resolve();
        } else if (modifyAction == 'r' || modifyAction == 'round') {
          //TODO
          throw new HarveyError('Rounding is not yet implemented.');
          resolve();
        } else if (modifyAction == 'd' || modifyAction == 'delete') {
          //TODO
          throw new HarveyError('Deleting is not yet implemented.');
          resolve();
        } else {
          process.stdout.write(`"${modifyAction}" is not a valid option.\n`);
          resolve(await modifyTimeEntry(timeEntry, roundingIncrement, config));
        }
      },
    );
  });
}

async function setNewTimeEntryTime(timeEntry: HarvestTimeEntry, config: Config): Promise<void> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Set new time (in minutes) : ', async (time: string) => {
      rl.close();
      if (isNaN(Number(time))) {
        process.stdout.write(`"${time}" is not a valid option.\n`);
        resolve(await setNewTimeEntryTime(timeEntry, config));
      }
      const hours = Number(time) / 60;
      if (hours < 0 || hours > 24) {
        process.stdout.write(
          `"${time}" is not a valid option. Time entry should be between 0 and 24 hours (0 and 1440 minutes).\n`,
        );
        resolve(await setNewTimeEntryTime(timeEntry, config));
      }
      timeEntry.hours = hours;
      await saveTimeEntry(timeEntry, config);
      resolve();
    });
  });
}

async function chooseModifyTimeEntry(timeEntries: HarvestTimeEntry[]): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Please choose an entry (ID) to modify: ', async (entryId: string) => {
      if (timeEntries[Number(entryId.trim())]) {
        rl.close();
        resolve(timeEntries[Number(entryId.trim())]);
      } else {
        rl.close();
        process.stdout.write(`Entry ID "${entryId}" is not a valid option.\n`);
        resolve(await chooseModifyTimeEntry(timeEntries));
      }
    });
  });
}
