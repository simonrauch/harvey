import { Config } from '../config';
import { HarveyError } from '../error';
import { getMyTimeEntriesPerDate, saveTimer } from '../harvest';
import Table from 'cli-table';
import { formatTimerHours } from '../helper';

export async function printDay(date: string, config: Config): Promise<void> {
  const timeEntries = await getMyTimeEntriesPerDate(date, config);
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
      updatePromises.push(saveTimer(timeEntry, config));
    });
    Promise.all(updatePromises).then(() => resolve());
  });
}
