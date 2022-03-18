"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForTimeEntryModifyAction = exports.askForNewHours = exports.askForNewNote = exports.askToChooseTimeEntryToModify = void 0;
const _1 = require(".");
const day_1 = require("../../business/day");
const cli_output_1 = require("../cli-output");
async function askToChooseTimeEntryToModify(timeEntries) {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Please choose an entry (ID) to modify: ', async (entryId) => {
            if (timeEntries[Number(entryId.trim())]) {
                rl.close();
                resolve(timeEntries[Number(entryId.trim())]);
            }
            else {
                rl.close();
                (0, cli_output_1.printMessage)(`Entry ID "${entryId}" is not a valid option.`);
                askToChooseTimeEntryToModify(timeEntries).then(resolve);
            }
        });
    });
}
exports.askToChooseTimeEntryToModify = askToChooseTimeEntryToModify;
async function askForNewNote() {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Set new note : ', async (notes) => {
            rl.close();
            resolve(notes);
        });
    });
}
exports.askForNewNote = askForNewNote;
async function askForNewHours() {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Set new time : ', async (time) => {
            rl.close();
            try {
                const hours = (0, _1.parseUserTimeInput)(time);
                if (hours < 0 || hours > 24) {
                    (0, cli_output_1.printMessage)(`"${time}" is not a valid option. Time entry should be between 0 and 24 hours. Please try again.`);
                    askForNewHours().then(resolve);
                }
                else {
                    resolve(hours);
                }
            }
            catch (error) {
                if (error instanceof _1.InvalidTimeInputHarveyError) {
                    (0, cli_output_1.printMessage)(`"${time}" is not a valid option. Please try again.`);
                    askForNewHours().then(resolve);
                }
                else {
                    throw error;
                }
            }
        });
    });
}
exports.askForNewHours = askForNewHours;
async function askForTimeEntryModifyAction() {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('What do you want to modify? (Options: t - time, n - notes, r - round, d - delete): ', async (modifyAction) => {
            rl.close();
            modifyAction = modifyAction.trim().toLowerCase();
            if (modifyAction == 't' || modifyAction == 'time') {
                resolve(day_1.TimeEntryModifyAction.time);
            }
            else if (modifyAction == 'n' || modifyAction == 'notes') {
                resolve(day_1.TimeEntryModifyAction.notes);
            }
            else if (modifyAction == 'r' || modifyAction == 'round') {
                resolve(day_1.TimeEntryModifyAction.round);
            }
            else if (modifyAction == 'd' || modifyAction == 'delete') {
                resolve(day_1.TimeEntryModifyAction.delete);
            }
            else {
                (0, cli_output_1.printMessage)(`"${modifyAction}" is not a valid option.`);
                askForTimeEntryModifyAction().then(resolve);
            }
        });
    });
}
exports.askForTimeEntryModifyAction = askForTimeEntryModifyAction;
