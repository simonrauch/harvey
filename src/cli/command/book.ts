import type { Arguments, CommandBuilder } from 'yargs';
import { getAliasOrCreate } from '../../business/alias';
import { HarveyConfig } from '../../business/config';
import { handleError } from '../../business/error';
import { bookTimeEntry } from '../../service/api/harvest';
import { convertDateInputToISODate, convertMinuteTimeInputToHours } from '../../business/helper';
import { HarvestTimeEntry } from '../../business/harvest';

type Options = {
  config: string;
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
      note: { type: 'string', alias: 'n', default: '' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
    })
    .positional('alias', { type: 'string', demandOption: true })
    .positional('minutes', { type: 'number', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias, note, date, minutes } = argv;

  try {
    HarveyConfig.loadConfig(config);
    const harvestAlias = await getAliasOrCreate(alias);
    const timeEntry: HarvestTimeEntry = {
      task_id: harvestAlias.idTask,
      project_id: harvestAlias.idProject,
      hours: convertMinuteTimeInputToHours(minutes),
      notes: note,
      spent_date: convertDateInputToISODate(date),
    };
    await bookTimeEntry(timeEntry);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
