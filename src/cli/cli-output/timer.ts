import Table from 'cli-table';
import { formatHours } from '.';
import { HarveyTimer, HarveyTimerStatus } from '../../business/timer';

export function printTimer(timer: HarveyTimer): void {
  const timeEntry = timer.timeEntry;
  let tableHead: string[] = ['Status'];
  let colWidth: number[] = [9];
  let tableRow: string[] = [getStatusString(timer.status)];

  if (timeEntry && timeEntry.task) {
    tableHead = tableHead.concat(['Task', 'Notes', 'Timer']);
    colWidth = colWidth.concat([44, 20, 7]);
    tableRow = tableRow.concat([timeEntry.task.name, (timeEntry.notes ??= ''), formatHours(timeEntry.hours)]);
  }

  const table = new Table({
    head: tableHead,
    colWidths: colWidth,
  });

  table.push(tableRow);

  process.stdout.write(table.toString() + '\n');
}

function getStatusString(status: HarveyTimerStatus): string {
  switch (status) {
    case HarveyTimerStatus.stopped:
      return 'STOPPED';
    case HarveyTimerStatus.running:
      return 'RUNNING';
    case HarveyTimerStatus.paused:
      return 'PAUSED';
    default:
      throw new Error('Cannot format status.');
  }
}
