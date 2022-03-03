import type { Arguments, CommandBuilder } from 'yargs';
import { getAliasOrCreate } from '../alias';
import type { Config } from '../config';
import { readConfigFile } from '../config';
import { handleError } from '../error';
import { bookTimeEntry } from '../harvest';
import { convertDateInputToISODate, convertMinuteTimeInputToHours } from '../helper';

type Options = {
  config: string;
  aliases: string;
  alias: string;
  note: string;
  date: string;
  minutes: number;
};

export const command = 'book <alias> <minutes>';
export const desc = 'Creates a harvest time entry.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      aliases: { type: 'string', alias: 'a', default: '~/.config/harvey/aliases.json' },
      note: { type: 'string', alias: 'n', default: '' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
    })
    .positional('alias', { type: 'string', demandOption: true })
    .positional('minutes', { type: 'number', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias, aliases, note, date, minutes } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    const harvestAlias = await getAliasOrCreate(alias, configuration, aliases);
    const timeEntry: HarvestTimeEntry = {
      task_id: harvestAlias.idTask,
      project_id: harvestAlias.idProject,
      hours: convertMinuteTimeInputToHours(minutes),
      notes: note,
      spent_date: convertDateInputToISODate(date),
    };
    await bookTimeEntry(timeEntry, configuration);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
