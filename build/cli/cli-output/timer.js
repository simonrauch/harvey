"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTimer = void 0;
const cli_table_1 = __importDefault(require("cli-table"));
const _1 = require(".");
const timer_1 = require("../../business/timer");
function printTimer(timer) {
    const timeEntry = timer.timeEntry;
    let tableHead = ['Status'];
    let colWidth = [9];
    let tableRow = [getStatusString(timer.status)];
    if (timeEntry && timeEntry.task) {
        tableHead = tableHead.concat(['Task', 'Notes', 'Timer']);
        colWidth = colWidth.concat([44, 20, 7]);
        tableRow = tableRow.concat([timeEntry.task.name, (timeEntry.notes ?? (timeEntry.notes = '')), (0, _1.formatHours)(timeEntry.hours)]);
    }
    const table = new cli_table_1.default({
        head: tableHead,
        colWidths: colWidth,
    });
    table.push(tableRow);
    process.stdout.write(table.toString() + '\n');
}
exports.printTimer = printTimer;
function getStatusString(status) {
    switch (status) {
        case timer_1.HarveyTimerStatus.stopped:
            return 'STOPPED';
        case timer_1.HarveyTimerStatus.running:
            return 'RUNNING';
        case timer_1.HarveyTimerStatus.paused:
            return 'PAUSED';
        default:
            throw new Error('Cannot format status.');
    }
}
