import { Alias, getAliasOrCreate } from '../alias';
import { HarveyConfig } from '../config';
import { HarveyError } from '../error';
import { bookTimeEntry } from '../../service/api/harvest';
import { convertMinuteTimeInputToHours } from '../helper';
import { CsvFileParser } from './file-parser/csv-file-parser';
import { XlsxFileParser } from './file-parser/xlsx-file-parser';
import { HarvestTimeEntry } from '../harvest';

export interface FileParser {
  parserKey: string;
  parseFile(filePath: string): Promise<ParserBookingEntry[]>;
}

export interface ParserBookingEntry {
  alias: string;
  minutes: number;
}

function getFileParsers(): FileParser[] {
  return [new CsvFileParser(), new XlsxFileParser()];
}

function getFileParserByKey(fileParserKey: string): FileParser {
  const fileParsers = getFileParsers();
  const foundFileParser = fileParsers.find((fileParser) => {
    return fileParser.parserKey == fileParserKey;
  });
  if (!foundFileParser) {
    throw new HarveyError(`No file parser implemented for type "${fileParserKey}".`);
  }
  return foundFileParser;
}

export async function parseFileAndBookEntries(filePath: string, date: string, note: string): Promise<void> {
  return new Promise((resolve) => {
    const config = HarveyConfig.getConfig();
    const fileParser = getFileParserByKey(config.fileParser.type);
    fileParser.parseFile(filePath).then((entries) => {
      bookEntries(entries, date, note).then(() => resolve());
    });
  });
}

async function bookEntries(entries: ParserBookingEntry[], date: string, note: string): Promise<void> {
  return new Promise((resolve) => {
    findAliases(entries).then((aliases) => {
      const timeEntries = mapAliasesAndEntriesToHarvestTimeEntry(aliases, entries, date, note);
      const timeEntryCreationPromises = [];
      for (const timeEntry of timeEntries) {
        timeEntryCreationPromises.push(bookTimeEntry(timeEntry));
      }
      Promise.all(timeEntryCreationPromises).then(() => {
        resolve();
      });
    });
  });
}

async function findAliases(entries: ParserBookingEntry[]): Promise<Alias[]> {
  const aliases: Alias[] = [];
  for (const entry of entries) {
    aliases.push(await getAliasOrCreate(entry.alias));
  }
  return new Promise((resolve) => {
    resolve(aliases);
  });
}
function mapAliasesAndEntriesToHarvestTimeEntry(
  aliases: Alias[],
  entries: ParserBookingEntry[],
  date: string,
  note: string,
): HarvestTimeEntry[] {
  const harvestTimeEntries = [];
  for (const entry of entries) {
    const alias = aliases.find((alias) => {
      return alias.alias == entry.alias;
    });
    if (!alias) {
      throw new HarveyError(`Alias "${entry.alias}" not found.`);
    }
    harvestTimeEntries.push({
      task_id: alias.idTask,
      project_id: alias.idProject,
      hours: convertMinuteTimeInputToHours(entry.minutes),
      notes: note,
      spent_date: date,
    });
  }

  return harvestTimeEntries;
}
