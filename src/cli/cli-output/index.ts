import yargs from 'yargs';

export function printMessage(message: string): void {
  process.stdout.write(message + '\n');
}

export function formatHours(hours: number): string {
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;

  return `${fullHours}:${String(Math.floor(minutes)).padStart(2, '0')}`;
}

export function getTableWidth(): number {
  const terminalWidth = yargs.terminalWidth() - 4;
  const maxWidth = 156;
  const minWidth = 36;

  if (terminalWidth > maxWidth) return maxWidth;
  if (terminalWidth < minWidth) return minWidth;
  return terminalWidth;
}
