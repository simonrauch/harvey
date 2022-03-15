import Table from 'cli-table';
import { HarvestTimeEntry } from '../../business/harvest';
import { formatTimerHours } from '../../business/helper';

export function printTimeEntryTable(timeEntries: HarvestTimeEntry[]): void {
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
