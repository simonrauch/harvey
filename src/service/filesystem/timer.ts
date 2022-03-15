import { deleteFile, readFromJsonFile, writeToJsonFile } from '.';
import { HarveyConfig } from '../../business/config';
import { HarvestTimeEntry } from '../../business/harvest';

export function storePausedTimer(timeEntry: HarvestTimeEntry): void {
  const config = HarveyConfig.getConfig();
  writeToJsonFile(timeEntry, config.pausedTimerFilePath);
}
export function deletePausedTimer(): void {
  const config = HarveyConfig.getConfig();
  deleteFile(config.pausedTimerFilePath);
}
export function readPausedTimer(): HarvestTimeEntry | null {
  const config = HarveyConfig.getConfig();
  return readFromJsonFile(config.pausedTimerFilePath);
}
