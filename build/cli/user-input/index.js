"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserDateInput = exports.parseUserTimeInput = exports.createReadlineInterface = exports.InvalidDateInputHarveyError = exports.InvalidTimeInputHarveyError = void 0;
const readline_1 = require("readline");
const error_1 = require("../../business/error");
class InvalidTimeInputHarveyError extends error_1.HarveyError {
    constructor(message) {
        if (message) {
            super(message);
        }
        else {
            super('Invalid time input.');
        }
    }
}
exports.InvalidTimeInputHarveyError = InvalidTimeInputHarveyError;
class InvalidDateInputHarveyError extends error_1.HarveyError {
    constructor(message) {
        if (message) {
            super(message);
        }
        else {
            super('Invalid date input.');
        }
    }
}
exports.InvalidDateInputHarveyError = InvalidDateInputHarveyError;
function createReadlineInterface() {
    return (0, readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout,
    });
}
exports.createReadlineInterface = createReadlineInterface;
function parseUserTimeInput(timeInput) {
    const hours = convertUserInputTimeStringToHourNumber(timeInput);
    if (hours < 0.0 || hours > 24.0) {
        throw new InvalidTimeInputHarveyError('Invalid time input. Time input has be between 0 and 24 hours.');
    }
    return hours;
}
exports.parseUserTimeInput = parseUserTimeInput;
function convertUserInputTimeStringToHourNumber(timeInput) {
    if (!isNaN(Number(timeInput)) && !timeInput.includes(',') && !timeInput.includes('.') && !timeInput.includes(':')) {
        return Number(timeInput) / 60;
    }
    if (timeInput.includes(',') && !timeInput.includes('.') && !timeInput.includes(':')) {
        timeInput = timeInput.replace(',', '.');
        if (isNaN(Number(timeInput))) {
            throw new InvalidTimeInputHarveyError();
        }
        return Number(timeInput);
    }
    if (timeInput.includes('.') && !timeInput.includes(',') && !timeInput.includes(':') && !isNaN(Number(timeInput))) {
        return Number(timeInput);
    }
    if (timeInput.includes(':') && !timeInput.includes(',') && !timeInput.includes(',')) {
        const hourMinuteSplit = timeInput.split(':');
        if (hourMinuteSplit.length !== 2) {
            throw new InvalidTimeInputHarveyError();
        }
        const hourString = hourMinuteSplit[0];
        const minuteString = hourMinuteSplit[1];
        if (hourString.length > 2 || minuteString.length > 2 || isNaN(Number(hourString)) || isNaN(Number(minuteString))) {
            throw new InvalidTimeInputHarveyError();
        }
        let hours = Number(hourString);
        hours += Number(minuteString) / 60;
        return hours;
    }
    throw new InvalidTimeInputHarveyError();
}
function parseUserDateInput(dateInput) {
    if (dateInput === undefined || dateInput === null || dateInput === '') {
        return formatDate(new Date());
    }
    const isoDateRegex = new RegExp('^([0-9]{4})(-?)(1[0-2]|0[1-9])\\2(3[01]|0[1-9]|[12][0-9])$');
    const date = new Date(dateInput);
    if (date.toDateString() === 'Invalid Date' || !isoDateRegex.test(dateInput)) {
        throw new InvalidDateInputHarveyError();
    }
    return formatDate(date);
}
exports.parseUserDateInput = parseUserDateInput;
function formatDate(date) {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
}
