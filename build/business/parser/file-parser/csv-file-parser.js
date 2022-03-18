"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvFileParser = void 0;
const error_1 = require("../../error");
class CsvFileParser {
    constructor() {
        this.parserKey = 'csv';
    }
    async parseFile(filePath) {
        throw new error_1.HarveyError(`Cannot parse ${filePath} yet. CSV file parser is not yet implemented.`);
    }
}
exports.CsvFileParser = CsvFileParser;
