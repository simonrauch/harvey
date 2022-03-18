"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFileAndBookEntries = void 0;
const alias_1 = require("../alias");
const config_1 = require("../config");
const error_1 = require("../error");
const harvest_1 = require("../../service/api/harvest");
const csv_file_parser_1 = require("./file-parser/csv-file-parser");
const xlsx_file_parser_1 = require("./file-parser/xlsx-file-parser");
function getFileParsers() {
    return [new csv_file_parser_1.CsvFileParser(), new xlsx_file_parser_1.XlsxFileParser()];
}
function getFileParserByKey(fileParserKey) {
    const fileParsers = getFileParsers();
    const foundFileParser = fileParsers.find((fileParser) => {
        return fileParser.parserKey == fileParserKey;
    });
    if (!foundFileParser) {
        throw new error_1.HarveyError(`No file parser implemented for type "${fileParserKey}".`);
    }
    return foundFileParser;
}
async function parseFileAndBookEntries(filePath, date, note) {
    return new Promise((resolve) => {
        const config = config_1.HarveyConfig.getConfig();
        const fileParser = getFileParserByKey(config.fileParser.type);
        fileParser.parseFile(filePath).then((entries) => {
            bookEntries(entries, date, note).then(() => resolve());
        });
    });
}
exports.parseFileAndBookEntries = parseFileAndBookEntries;
async function bookEntries(entries, date, note) {
    return new Promise((resolve) => {
        findAliases(entries).then((aliases) => {
            const timeEntries = mapAliasesAndEntriesToHarvestTimeEntry(aliases, entries, date, note);
            const timeEntryCreationPromises = [];
            for (const timeEntry of timeEntries) {
                timeEntryCreationPromises.push((0, harvest_1.saveTimeEntry)(timeEntry));
            }
            Promise.all(timeEntryCreationPromises).then(() => {
                resolve();
            });
        });
    });
}
async function findAliases(entries) {
    const aliases = [];
    for (const entry of entries) {
        aliases.push(await (0, alias_1.getAliasOrCreate)(entry.alias));
    }
    return new Promise((resolve) => {
        resolve(aliases);
    });
}
function mapAliasesAndEntriesToHarvestTimeEntry(aliases, entries, date, note) {
    const harvestTimeEntries = [];
    for (const entry of entries) {
        const alias = aliases.find((alias) => {
            return alias.alias == entry.alias;
        });
        if (!alias) {
            throw new error_1.HarveyError(`Alias "${entry.alias}" not found.`);
        }
        harvestTimeEntries.push({
            task_id: alias.idTask,
            project_id: alias.idProject,
            hours: entry.hours,
            notes: note,
            spent_date: date,
        });
    }
    return harvestTimeEntries;
}
