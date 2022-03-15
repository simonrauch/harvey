import { HarvestTimeEntry } from '../harvest';

export function roundTimeEntry(timeEntry: HarvestTimeEntry, roundingInterval: number): HarvestTimeEntry {
  const minutes = timeEntry.hours * 60;
  timeEntry.hours = (Math.ceil(minutes / roundingInterval) * roundingInterval) / 60;
  return timeEntry;
}
