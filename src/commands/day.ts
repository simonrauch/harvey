import type { Arguments, CommandBuilder } from 'yargs';
import type { Config } from '../config';
import { readConfigFile } from '../config';
import { printDay, roundDay } from '../day';
import { handleError } from '../error';
import { convertDateInputToISODate } from '../helper';

type Options = {
  config: string;
  date: string;
  action: string;
  rounding_increment?: number;
};

export const command = 'day <action>';
export const desc = 'Controls a timer.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
      rounding_increment: { type: 'number', alias: 'r' },
    })
    .positional('action', {
      type: 'string',
      demandOption: true,
      choices: ['status', 'round'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, date, action, rounding_increment } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    switch (action) {
      case 'status':
        await printDay(convertDateInputToISODate(date), configuration);
        break;
      case 'round':
        await roundDay(
          convertDateInputToISODate(date),
          rounding_increment ?? configuration.defaultRoundingIncrement,
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
