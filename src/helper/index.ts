import { HarveyError } from '../error';

export function convertDateInputToISODate(dateInput?: string): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  // TODO check if date input is correct

  return date.toISOString().substring(0, 10);
}

export function convertMinuteTimeInputToHours(minuteInput: number): number {
  if (isNaN(minuteInput)) {
    throw new HarveyError(`<minutes> is not a number.`);
  }
  if (minuteInput <= 0 || minuteInput >= 1440) {
    throw new HarveyError(`<minutes> input should be between 0 and 1440.`);
  }

  return minuteInput / 60;
}
