import { HarveyError } from '../error';

export function convertDateInputToISODate(dateInput?: string): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  // TODO check if date input is correct

  return date.toISOString().substring(0, 10);
}

export function formatTimerHours(hours: number): string {
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;

  return `${fullHours}:${String(Math.floor(minutes)).padStart(2, '0')}`;
}
