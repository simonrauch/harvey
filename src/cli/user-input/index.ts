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
