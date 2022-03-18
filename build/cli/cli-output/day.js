"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTimeEntryTable = void 0;
const cli_table_1 = __importDefault(require("cli-table"));
const _1 = require(".");
function printTimeEntryTable(timeEntries) {
    let totalTime = 0;
    const table = new cli_table_1.default({
        head: ['ID', 'Task', 'Notes', 'Time'],
        colWidths: [4, 49, 20, 7],
    });
    timeEntries.forEach((timeEntry, index) => {
        totalTime += timeEntry.hours;
        table.push([index, timeEntry.task?.name ?? '', timeEntry.notes ?? '', (0, _1.formatHours)(timeEntry.hours)]);
    });
    process.stdout.write(table.toString() + '\n');
    process.stdout.write(' Sum:                                                                         ' + (0, _1.formatHours)(totalTime) + '\n\n');
}
exports.printTimeEntryTable = printTimeEntryTable;
