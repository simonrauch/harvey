import { FileParser, ParserBookingEntry } from '..';

export interface CsvFileParserConfig {
  worksheet: string;
  aliasColumn: string;
  minutesColumn: string;
}

export class CsvFileParser implements FileParser {
  parserKey: string = 'csv';
  async parseFile(filePath: string): Promise<ParserBookingEntry[]> {
    throw new Error('Method not implemented.');
  }
}
