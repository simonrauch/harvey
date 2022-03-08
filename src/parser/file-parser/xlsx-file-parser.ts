import { Cell, Workbook, Worksheet } from 'exceljs';
import type { FileParser, ParserBookingEntry } from '..';
import { Config } from '../../config';
import { HarveyError } from '../../error';

export interface XlsxFileParserConfig {
  worksheet: string;
  aliasColumn: string;
  minutesColumn: string;
}
export class XlsxFileParser implements FileParser {
  parserKey: string = 'xlsx';
  async parseFile(filePath: string, config: Config): Promise<ParserBookingEntry[]> {
    return new Promise(async (resolve) => {
      const workbook = await this.readFile(filePath);
      const worksheet = this.findWorksheetByName(config.fileParser.config.worksheet, workbook);
      const aliasHeadingCell = this.findCellByValue(config.fileParser.config.aliasColumn, worksheet);
      const minutesHeadingCell = this.findCellByValue(config.fileParser.config.minutesColumn, worksheet);
      let aliasCell = worksheet.getCell(aliasHeadingCell.row + 1, aliasHeadingCell.col);
      let minutesCell = worksheet.getCell(minutesHeadingCell.row + 1, minutesHeadingCell.col);
      let entries: ParserBookingEntry[] = [];

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
