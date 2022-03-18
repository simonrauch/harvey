"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundTimeEntry = void 0;
function roundTimeEntry(timeEntry, roundingInterval) {
    const minutes = timeEntry.hours * 60;
    timeEntry.hours = (Math.ceil(minutes / roundingInterval) * roundingInterval) / 60;
    return timeEntry;
}
exports.roundTimeEntry = roundTimeEntry;
