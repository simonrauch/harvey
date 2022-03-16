import type { Arguments, CommandBuilder } from 'yargs';
import { HarveyConfig } from '../../business/config';
import { handleError } from '../../business/error';
import { parseFileAndBookEntries } from '../../business/parser';
import { parseUserDateInput } from '../user-input';

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
      date: { type: 'string', alias: 'd', default: parseUserDateInput() },
    })
    .positional('file', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, file, note, date } = argv;

  try {
    HarveyConfig.loadConfig(config);
    await parseFileAndBookEntries(file, parseUserDateInput(date), note);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
