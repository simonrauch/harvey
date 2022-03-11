import { Cell, Workbook, Worksheet } from 'exceljs';
import type { FileParser, ParserBookingEntry } from '..';
import { Config } from '../../config';
import { HarveyError } from '../../error';

export class XlsxFileParser implements FileParser {
  parserKey = 'xlsx';
  async parseFile(filePath: string, config: Config): Promise<ParserBookingEntry[]> {
    return new Promise((resolve) => {
      this.readFile(filePath).then((workbook) => {
        const worksheet = this.findWorksheetByName((config.fileParser.worksheet ??= 'Timebooking'), workbook);
        const aliasHeadingCell = this.findCellByValue((config.fileParser.aliasColumn ??= 'Link'), worksheet);
        const minutesHeadingCell = this.findCellByValue((config.fileParser.minutesColumn ??= 'Minutes'), worksheet);
        let aliasCell = worksheet.getCell(aliasHeadingCell.row + 1, aliasHeadingCell.col);
        let minutesCell = worksheet.getCell(minutesHeadingCell.row + 1, minutesHeadingCell.col);
        const entries: ParserBookingEntry[] = [];

        while (aliasCell.text) {
          entries.push({
            alias: aliasCell.text,
            minutes: Number(minutesCell.text),
          });
          aliasCell = worksheet.getCell(aliasCell.row + 1, aliasCell.col);
          minutesCell = worksheet.getCell(minutesCell.row + 1, minutesCell.col);
        }
        resolve(entries);
      });
    });
  }
  private async readFile(filePath: string): Promise<Workbook> {
    const workbook = new Workbook();
    return workbook.xlsx.readFile(filePath);
  }
  private findWorksheetByName(name: string, workbook: Workbook): Worksheet {
    const foundWorksheet = workbook.worksheets.find((worksheet) => {
      return worksheet.name.toLowerCase().includes(name.toLowerCase());
    });
    if (foundWorksheet) {
      return foundWorksheet;
    }
    throw new HarveyError(`Could not find worksheet "${name}".`);
  }
  private findCellByValue(value: string, worksheet: Worksheet): Cell {
    let match;
    worksheet.eachRow((row) =>
      row.eachCell((cell) => {
        if (cell.text && cell.text.toLowerCase().includes(value.toLowerCase())) {
          match = cell;
        }
      }),
    );

    if (match) {
      return match;
    }

    throw new HarveyError(`Could not find cell with value "${value}".`);
  }
}
