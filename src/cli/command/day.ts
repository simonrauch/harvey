import type { Arguments, CommandBuilder } from 'yargs';
import { HarveyConfig } from '../../business/config';
import { modifyDay, printDay, roundDay } from '../../business/day';
import { handleError } from '../../business/error';
import { convertDateInputToISODate } from '../../business/helper';

type Options = {
  config: string;
  date: string;
  action: string;
  rounding_interval?: number;
};

export const command = 'day [<action>]';
export const desc = 'Controls the time entries of a day.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
      rounding_interval: { type: 'number', alias: 'ri' },
    })
    .positional('action', {
      type: 'string',
      default: 'status',
      choices: ['status', 'modify', 'round'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, date, action, rounding_interval } = argv;

  try {
    HarveyConfig.loadConfig(config);
    const configuration = HarveyConfig.getConfig();
    switch (action) {
      case 'status':
        await printDay(convertDateInputToISODate(date));
        break;
      case 'round':
        await roundDay(convertDateInputToISODate(date), rounding_interval ?? configuration.defaultRoundingInterval);
        await printDay(convertDateInputToISODate(date));
        break;
      case 'modify':
        await modifyDay(convertDateInputToISODate(date), rounding_interval ?? configuration.defaultRoundingInterval);
        await printDay(convertDateInputToISODate(date));
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
