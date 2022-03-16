export function printMessage(message: string): void {
  process.stdout.write(message + '\n');
}

export function formatHours(hours: number): string {
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;

  return `${fullHours}:${String(Math.floor(minutes)).padStart(2, '0')}`;
}
