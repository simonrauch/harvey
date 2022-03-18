"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatHours = exports.printMessage = void 0;
function printMessage(message) {
    process.stdout.write(message + '\n');
}
exports.printMessage = printMessage;
function formatHours(hours) {
    const fullHours = Math.floor(hours);
    const minutes = (hours - fullHours) * 60;
    return `${fullHours}:${String(Math.floor(minutes)).padStart(2, '0')}`;
}
exports.formatHours = formatHours;
