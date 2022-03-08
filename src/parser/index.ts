import { Alias, getAliasOrCreate } from '../alias';
import { Config } from '../config';
import { HarveyError } from '../error';
import { bookTimeEntry } from '../harvest';
import { convertMinuteTimeInputToHours } from '../helper';
import { CsvFileParser } from './file-parser/csv-file-parser';
import { XlsxFileParser } from './file-parser/xlsx-file-parser';

export interface FileParser {
  parserKey: string;
  parseFile(filePath: string, config: Config): Promise<ParserBookingEntry[]>;
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

export async function parseFileAndBookEntries(
  filePath: string,
  date: string,
  note: string,
  config: Config,
): Promise<void> {
  return new Promise(async (resolve) => {
    const fileParser = getFileParserByKey(config.fileParser.type);
    const entries = await fileParser.parseFile(filePath, config);
    await bookEntries(entries, date, note, config);
    resolve();
  });
}

async function bookEntries(entries: ParserBookingEntry[], date: string, note: string, config: Config): Promise<void> {
  return new Promise(async (resolve) => {
    const aliases = await findAliases(entries, config);
    const timeEntries = mapAliasesAndEntriesToHarvestTimeEntry(aliases, entries, date, note);
    let timeEntryCreationPromises = [];
    for (const timeEntry of timeEntries) {
      timeEntryCreationPromises.push(bookTimeEntry(timeEntry, config));
    }
    Promise.all(timeEntryCreationPromises).then(() => {
      resolve();
    });
  });
}

async function findAliases(entries: ParserBookingEntry[], config: Config): Promise<Alias[]> {
  return new Promise(async (resolve) => {
    let aliases = [];
    for (const entry of entries) {
      aliases.push(await getAliasOrCreate(entry.alias, config));
    }
    resolve(aliases);
  });
}
function mapAliasesAndEntriesToHarvestTimeEntry(
  aliases: Alias[],
  entries: ParserBookingEntry[],
  date: string,
  note: string,
): HarvestTimeEntry[] {
  let harvestTimeEntries = [];
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
