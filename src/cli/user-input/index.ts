import { createInterface, Interface } from 'readline';
import { HarveyError } from '../../business/error';

export class InvalidTimeInputHarveyError extends HarveyError {
  constructor(message?: string) {
    if (message) {
      super(message);
    } else {
      super('Invalid time input.');
    }
  }
}

export class InvalidDateInputHarveyError extends HarveyError {
  constructor(message?: string) {
    if (message) {
      super(message);
    } else {
      super('Invalid date input.');
    }
  }
}

export function createReadlineInterface(): Interface {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function parseUserTimeInput(timeInput: string): number {
  const hours = convertUserInputTimeStringToHourNumber(timeInput);
  if (hours < 0.0 || hours > 24.0) {
    throw new InvalidTimeInputHarveyError('Invalid time input. Time input has be between 0 and 24 hours.');
  }
  return hours;
}

function convertUserInputTimeStringToHourNumber(timeInput: string): number {
  if (!isNaN(Number(timeInput)) && !timeInput.includes(',') && !timeInput.includes('.') && !timeInput.includes(':')) {
    return Number(timeInput) / 60;
  }
  if (timeInput.includes(',') && !timeInput.includes('.') && !timeInput.includes(':')) {
    timeInput = timeInput.replace(',', '.');
    if (isNaN(Number(timeInput))) {
      throw new InvalidTimeInputHarveyError();
    }
    return Number(timeInput);
  }
  if (timeInput.includes('.') && !timeInput.includes(',') && !timeInput.includes(':') && !isNaN(Number(timeInput))) {
    return Number(timeInput);
  }
  if (timeInput.includes(':') && !timeInput.includes(',') && !timeInput.includes(',')) {
    const hourMinuteSplit = timeInput.split(':');
    if (hourMinuteSplit.length !== 2) {
      throw new InvalidTimeInputHarveyError();
    }
    const hourString = hourMinuteSplit[0];
    const minuteString = hourMinuteSplit[1];

    if (hourString.length > 2 || minuteString.length > 2 || isNaN(Number(hourString)) || isNaN(Number(minuteString))) {
      throw new InvalidTimeInputHarveyError();
    }

    let hours = Number(hourString);
    hours += Number(minuteString) / 60;

    return hours;
  }

  throw new InvalidTimeInputHarveyError();
}

export function parseUserDateInput(dateInput?: string): string {
  if (dateInput === undefined || dateInput === null || dateInput === '') {
    return formatDate(new Date());
  }

  if (isRealtiveDateInputString(dateInput)) {
    const dateFromRelativeDateInput = getDateFromRelativeDateInputString(dateInput);
    return formatDate(dateFromRelativeDateInput);
  }

  const isoDateRegex = new RegExp('^([0-9]{4})(-?)(1[0-2]|0[1-9])\\2(3[01]|0[1-9]|[12][0-9])$');
  const date = new Date(dateInput);
  if (date.toDateString() === 'Invalid Date' || !isoDateRegex.test(dateInput)) {
    throw new InvalidDateInputHarveyError();
  }
  return formatDate(date);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}

function splitRelativeDateInputString(dateInputString: string): string[] {
  const number = dateInputString.replace(/[^0-9]/g, '');
  const split = dateInputString.split(number);
  const operation = split[0];
  const timeFrame = split[1] ?? 'day';

  return [operation, number, timeFrame];
}

function isRealtiveDateInputString(dateInputString: string): boolean {
  const split = splitRelativeDateInputString(dateInputString);

  if (split[0] !== '+' && split[0] !== '-') return false;
  if (isNaN(Number(split[1]))) return false;
  if (Number(split[1]) === 0) return false;
  if (!isValidTimeFrameString(split[2])) return false;

  return true;
}

function getDateFromRelativeDateInputString(dateInput: string): Date {
  const split = splitRelativeDateInputString(dateInput);

  let relativeDays = Number(split[1]);

  if (isRelativeWeekInput(split[2])) {
    relativeDays = relativeDays * 7;
  }

  const date = new Date();

  if (split[0] === '+') date.setDate(date.getDate() + relativeDays);
  if (split[0] === '-') date.setDate(date.getDate() - relativeDays);

  return date;
}

function isValidTimeFrameString(timeFrameString: string): boolean {
  const validTimeFrames = ['week', 'weeks', 'w', 'day', 'days', 'd', ''];
  return validTimeFrames.includes(timeFrameString);
}

function isRelativeWeekInput(dateInputString: string): boolean {
  const weekTimeFrames = ['week', 'weeks', 'w'];
  return weekTimeFrames.includes(dateInputString);
}
