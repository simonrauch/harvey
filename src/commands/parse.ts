import type { Arguments, CommandBuilder } from 'yargs';
import { getAliasOrCreate } from '../alias';
import type { Config } from '../config';
import { readConfigFile } from '../config';
import { handleError } from '../error';
import { bookTimeEntry } from '../harvest';
import { convertDateInputToISODate, convertMinuteTimeInputToHours } from '../helper';
import { parseFileAndBookEntries } from '../parser';

type Options = {
  config: string;
  note: string;
  date: string;
  file: string;
};

export const command = 'parse <file>';
export const desc = 'Creates a harvest time entry.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      note: { type: 'string', alias: 'n', default: '' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
    })
    .positional('file', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, file, note, date } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    await parseFileAndBookEntries(file, convertDateInputToISODate(date), note, configuration);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
