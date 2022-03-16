import { createReadlineInterface, InvalidTimeInputHarveyError, parseUserTimeInput } from '.';
import { TimeEntryModifyAction } from '../../business/day';
import { HarvestTimeEntry } from '../../business/harvest';
import { printMessage } from '../cli-output';

export async function askToChooseTimeEntryToModify(timeEntries: HarvestTimeEntry[]): Promise<HarvestTimeEntry> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();

    rl.question('Please choose an entry (ID) to modify: ', async (entryId: string) => {
      if (timeEntries[Number(entryId.trim())]) {
        rl.close();
        resolve(timeEntries[Number(entryId.trim())]);
      } else {
        rl.close();
        printMessage(`Entry ID "${entryId}" is not a valid option.`);
        askToChooseTimeEntryToModify(timeEntries).then(resolve);
      }
    });
  });
}

export async function askForNewNote(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Set new note : ', async (notes: string) => {
      rl.close();
      resolve(notes);
    });
  });
}

export async function askForNewHours(): Promise<number> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Set new time : ', async (time: string) => {
      rl.close();
      try {
        const hours = parseUserTimeInput(time);
        if (hours < 0 || hours > 24) {
          printMessage(
            `"${time}" is not a valid option. Time entry should be between 0 and 24 hours. Please try again.`,
          );
          askForNewHours().then(resolve);
        } else {
          resolve(hours);
        }
      } catch (error) {
        if (error instanceof InvalidTimeInputHarveyError) {
          printMessage(`"${time}" is not a valid option. Please try again.`);
          askForNewHours().then(resolve);
        } else {
          throw error;
        }
      }
    });
  });
}

export async function askForTimeEntryModifyAction(): Promise<TimeEntryModifyAction> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question(
      'What do you want to modify? (Options: t - time, n - notes, r - round, d - delete): ',
      async (modifyAction: string) => {
        rl.close();
        modifyAction = modifyAction.trim().toLowerCase();
        if (modifyAction == 't' || modifyAction == 'time') {
          resolve(TimeEntryModifyAction.time);
        } else if (modifyAction == 'n' || modifyAction == 'notes') {
          resolve(TimeEntryModifyAction.notes);
        } else if (modifyAction == 'r' || modifyAction == 'round') {
          resolve(TimeEntryModifyAction.round);
        } else if (modifyAction == 'd' || modifyAction == 'delete') {
          resolve(TimeEntryModifyAction.delete);
        } else {
          printMessage(`"${modifyAction}" is not a valid option.`);
          askForTimeEntryModifyAction().then(resolve);
        }
      },
    );
  });
}
