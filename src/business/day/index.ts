import { deleteTimeEntry, getMyTimeEntriesPerDate, saveTimeEntry as saveTimeEntry } from '../../service/api/harvest';
import {
  askForNewHours,
  askForNewNote,
  askForTimeEntryModifyAction,
  askToChooseTimeEntryToModify,
} from '../../presentation/user-input/day';
import { printTimeEntryTable } from '../../presentation/cli-output/day';
import { roundTimeEntry } from '../round';
import { HarvestTimeEntry } from '../harvest';

export async function printDay(date: string): Promise<void> {
  return new Promise((resolve) => {
    getMyTimeEntriesPerDate(date).then((timeEntries) => {
      printTimeEntryTable(timeEntries);
      resolve();
    });
  });
}

export async function roundDay(date: string, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    getMyTimeEntriesPerDate(date).then((timeEntries) => {
      const updatePromises: Promise<HarvestTimeEntry>[] = [];
      timeEntries.forEach((timeEntry) => {
        timeEntry = roundTimeEntry(timeEntry, roundingInterval);
        updatePromises.push(saveTimeEntry(timeEntry));
      });
      Promise.all(updatePromises).then(() => resolve());
    });
  });
}
export async function modifyDay(date: string, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    getMyTimeEntriesPerDate(date).then((timeEntries) => {
      printTimeEntryTable(timeEntries);
      askToChooseTimeEntryToModify(timeEntries).then((timeEntry) => {
        modifyTimeEntry(timeEntry, roundingInterval).then(resolve);
      });
    });
  });
}

export enum TimeEntryModifyAction {
  time,
  notes,
  round,
  delete,
}
async function modifyTimeEntry(timeEntry: HarvestTimeEntry, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    askForTimeEntryModifyAction().then((modifyAction) => {
      switch (modifyAction) {
        case TimeEntryModifyAction.time:
          setNewTimeEntryTime(timeEntry).then(resolve);
          break;
        case TimeEntryModifyAction.notes:
          setNewTimeEntryNote(timeEntry).then(resolve);
          break;
        case TimeEntryModifyAction.round:
          roundAndSaveTimeEntry(timeEntry, roundingInterval).then(resolve);
          break;
        case TimeEntryModifyAction.delete:
          deleteTimeEntry(timeEntry).then(resolve);
          break;
      }
    });
  });
}

async function roundAndSaveTimeEntry(timeEntry: HarvestTimeEntry, roundingInterval: number): Promise<void> {
  return new Promise((resolve) => {
    timeEntry = roundTimeEntry(timeEntry, roundingInterval);
    saveTimeEntry(timeEntry).then(() => resolve());
  });
}

async function setNewTimeEntryTime(timeEntry: HarvestTimeEntry): Promise<void> {
  return new Promise((resolve) => {
    askForNewHours().then((hours) => {
      timeEntry.hours = hours;
      saveTimeEntry(timeEntry).then(() => resolve());
    });
  });
}

async function setNewTimeEntryNote(timeEntry: HarvestTimeEntry): Promise<void> {
  return new Promise((resolve) => {
    askForNewNote().then((newNote) => {
      timeEntry.notes = newNote;
      saveTimeEntry(timeEntry).then(() => {
        resolve();
      });
    });
  });
}
