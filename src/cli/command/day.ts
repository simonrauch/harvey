import type { Arguments, CommandBuilder } from 'yargs';
import { HarveyConfig } from '../../business/config';
import { modifyDay, printDay, roundDay } from '../../business/day';
import { handleError } from '../../business/error';
import { parseUserDateInput } from '../user-input';

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
      date: { type: 'string', alias: 'd', default: parseUserDateInput() },
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
        await printDay(parseUserDateInput(date));
        break;
      case 'round':
        await roundDay(parseUserDateInput(date), rounding_interval ?? configuration.defaultRoundingInterval);
        await printDay(parseUserDateInput(date));
        break;
      case 'modify':
        await modifyDay(parseUserDateInput(date), rounding_interval ?? configuration.defaultRoundingInterval);
        await printDay(parseUserDateInput(date));
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
