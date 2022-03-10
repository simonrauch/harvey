import type { Arguments, CommandBuilder } from 'yargs';
import type { Config } from '../business/config';
import { readConfigFile } from '../business/config';
import { modifyDay, printDay, roundDay } from '../business/day';
import { handleError } from '../business/error';
import { convertDateInputToISODate } from '../business/helper';

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
      rounding_interval: { type: 'number', alias: 'r' },
    })
    .positional('action', {
      type: 'string',
      default: 'status',
      choices: ['status', 'modify', 'round'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, date, action, rounding_interval } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    switch (action) {
      case 'status':
        await printDay(convertDateInputToISODate(date), configuration);
        break;
      case 'round':
        await roundDay(
          convertDateInputToISODate(date),
          rounding_interval ?? configuration.defaultRoundingInterval,
          configuration,
        );
        await printDay(convertDateInputToISODate(date), configuration);
        break;
      case 'modify':
        await modifyDay(
          convertDateInputToISODate(date),
          rounding_interval ?? configuration.defaultRoundingInterval,
          configuration,
        );
        await printDay(convertDateInputToISODate(date), configuration);
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
