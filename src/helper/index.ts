import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { HarveyError, HarveyFileNotFoundError } from '../error';

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

export function formatTimerHours(hours: number): string {
  const fullHours = Math.floor(hours);
  const minutes = (hours - fullHours) * 60;

  return `${fullHours}:${String(Math.floor(minutes)).padStart(2, '0')}`;
}

export function transformPath(filePath: string): string {
  return filePath.replace('~', homedir());
}

export function fileExists(filePath: string): boolean {
  filePath = transformPath(filePath);
  return fs.existsSync(filePath);
}

export function readFromJsonFile(filePath: string): any {
  if (!fileExists(filePath)) {
    return null;
  }
  filePath = transformPath(filePath);
  return JSON.parse(fs.readFileSync(filePath).toString());
}

export function writeToJsonFile(content: any, filePath: string, pretty: boolean = false): void {
  filePath = transformPath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(content, null, pretty ? 2 : undefined), 'utf8');
}

export function deleteFile(filePath: string): void {
  filePath = transformPath(filePath);
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
  }
}
