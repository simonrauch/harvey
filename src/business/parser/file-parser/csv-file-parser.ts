import { FileParser, ParserBookingEntry } from '..';

export class CsvFileParser implements FileParser {
  parserKey: string = 'csv';
  async parseFile(filePath: string): Promise<ParserBookingEntry[]> {
    throw new Error('Method not implemented.');
  }
}
