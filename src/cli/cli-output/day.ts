import Table from 'cli-table';
import { formatHours, getMaxTableWidth } from '.';
import { HarvestTimeEntry } from '../../business/harvest';

export function printTimeEntryTable(timeEntries: HarvestTimeEntry[]): void {
  const totalWidth = getMaxTableWidth();
  let totalTime = 0;
  const table = new Table({
    head: ['ID', 'Task', 'Notes', 'Time'],
    colWidths: [4, Math.floor((totalWidth - 11) * 0.65), Math.floor((totalWidth - 11) * 0.35), 7],
  });

  timeEntries.forEach((timeEntry, index) => {
    totalTime += timeEntry.hours;
    table.push([index, timeEntry.task?.name ?? '', timeEntry.notes ?? '', formatHours(timeEntry.hours)]);
  });
  process.stdout.write(table.toString() + '\n');
  process.stdout.write(' Sum:' + new Array(totalWidth - 7).join(' ') + formatHours(totalTime) + '\n\n');
}
