"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEntryModifyAction = exports.modifyDay = exports.roundDay = exports.printDay = void 0;
const harvest_1 = require("../../service/api/harvest");
const day_1 = require("../../cli/user-input/day");
const day_2 = require("../../cli/cli-output/day");
const round_1 = require("../round");
async function printDay(date) {
    return new Promise((resolve) => {
        (0, harvest_1.getMyTimeEntriesPerDate)(date).then((timeEntries) => {
            (0, day_2.printTimeEntryTable)(timeEntries);
            resolve();
        });
    });
}
exports.printDay = printDay;
async function roundDay(date, roundingInterval) {
    return new Promise((resolve) => {
        (0, harvest_1.getMyTimeEntriesPerDate)(date).then((timeEntries) => {
            const updatePromises = [];
            timeEntries.forEach((timeEntry) => {
                timeEntry = (0, round_1.roundTimeEntry)(timeEntry, roundingInterval);
                updatePromises.push((0, harvest_1.saveTimeEntry)(timeEntry));
            });
            Promise.all(updatePromises).then(() => resolve());
        });
    });
}
exports.roundDay = roundDay;
async function modifyDay(date, roundingInterval) {
    return new Promise((resolve) => {
        (0, harvest_1.getMyTimeEntriesPerDate)(date).then((timeEntries) => {
            (0, day_2.printTimeEntryTable)(timeEntries);
            (0, day_1.askToChooseTimeEntryToModify)(timeEntries).then((timeEntry) => {
                modifyTimeEntry(timeEntry, roundingInterval).then(resolve);
            });
        });
    });
}
exports.modifyDay = modifyDay;
var TimeEntryModifyAction;
(function (TimeEntryModifyAction) {
    TimeEntryModifyAction[TimeEntryModifyAction["time"] = 0] = "time";
    TimeEntryModifyAction[TimeEntryModifyAction["notes"] = 1] = "notes";
    TimeEntryModifyAction[TimeEntryModifyAction["round"] = 2] = "round";
    TimeEntryModifyAction[TimeEntryModifyAction["delete"] = 3] = "delete";
})(TimeEntryModifyAction = exports.TimeEntryModifyAction || (exports.TimeEntryModifyAction = {}));
async function modifyTimeEntry(timeEntry, roundingInterval) {
    return new Promise((resolve) => {
        (0, day_1.askForTimeEntryModifyAction)().then((modifyAction) => {
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
                    (0, harvest_1.deleteTimeEntry)(timeEntry).then(resolve);
                    break;
            }
        });
    });
}
async function roundAndSaveTimeEntry(timeEntry, roundingInterval) {
    return new Promise((resolve) => {
        timeEntry = (0, round_1.roundTimeEntry)(timeEntry, roundingInterval);
        (0, harvest_1.saveTimeEntry)(timeEntry).then(() => resolve());
    });
}
async function setNewTimeEntryTime(timeEntry) {
    return new Promise((resolve) => {
        (0, day_1.askForNewHours)().then((hours) => {
            timeEntry.hours = hours;
            (0, harvest_1.saveTimeEntry)(timeEntry).then(() => resolve());
        });
    });
}
async function setNewTimeEntryNote(timeEntry) {
    return new Promise((resolve) => {
        (0, day_1.askForNewNote)().then((newNote) => {
            timeEntry.notes = newNote;
            (0, harvest_1.saveTimeEntry)(timeEntry).then(() => {
                resolve();
            });
        });
    });
}
