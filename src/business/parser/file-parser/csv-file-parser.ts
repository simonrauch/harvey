import { FileParser, ParserBookingEntry } from '..';
import { HarveyError } from '../../error';

export class CsvFileParser implements FileParser {
  parserKey = 'csv';
  async parseFile(filePath: string): Promise<ParserBookingEntry[]> {
    throw new HarveyError(`Cannot parse ${filePath} yet. CSV file parser is not yet implemented.`);
  }
}
