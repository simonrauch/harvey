"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XlsxFileParser = void 0;
const exceljs_1 = require("exceljs");
const user_input_1 = require("../../../cli/user-input");
const config_1 = require("../../config");
const error_1 = require("../../error");
class XlsxFileParser {
    constructor() {
        this.parserKey = 'xlsx';
    }
    async parseFile(filePath) {
        return new Promise((resolve) => {
            const config = config_1.HarveyConfig.getConfig();
            this.readFile(filePath).then((workbook) => {
                var _a, _b, _c;
                const worksheet = this.findWorksheetByName(((_a = config.fileParser).worksheet ?? (_a.worksheet = 'Timebooking')), workbook);
                const aliasHeadingCell = this.findCellByValue(((_b = config.fileParser).aliasColumn ?? (_b.aliasColumn = 'Link')), worksheet);
                const minutesHeadingCell = this.findCellByValue(((_c = config.fileParser).minutesColumn ?? (_c.minutesColumn = 'Minutes')), worksheet);
                let aliasCell = worksheet.getCell(aliasHeadingCell.row + 1, aliasHeadingCell.col);
                let minutesCell = worksheet.getCell(minutesHeadingCell.row + 1, minutesHeadingCell.col);
                const entries = [];
                while (aliasCell.text) {
                    entries.push({
                        alias: aliasCell.text,
                        hours: (0, user_input_1.parseUserTimeInput)(minutesCell.text),
                    });
                    aliasCell = worksheet.getCell(aliasCell.row + 1, aliasCell.col);
                    minutesCell = worksheet.getCell(minutesCell.row + 1, minutesCell.col);
                }
                resolve(entries);
            });
        });
    }
    async readFile(filePath) {
        const workbook = new exceljs_1.Workbook();
        return workbook.xlsx.readFile(filePath);
    }
    findWorksheetByName(name, workbook) {
        const foundWorksheet = workbook.worksheets.find((worksheet) => {
            return worksheet.name.toLowerCase().includes(name.toLowerCase());
        });
        if (foundWorksheet) {
            return foundWorksheet;
        }
        throw new error_1.HarveyError(`Could not find worksheet "${name}".`);
    }
    findCellByValue(value, worksheet) {
        let match;
        worksheet.eachRow((row) => row.eachCell((cell) => {
            if (cell.text && cell.text.toLowerCase().includes(value.toLowerCase())) {
                match = cell;
            }
        }));
        if (match) {
            return match;
        }
        throw new error_1.HarveyError(`Could not find cell with value "${value}".`);
    }
}
exports.XlsxFileParser = XlsxFileParser;
