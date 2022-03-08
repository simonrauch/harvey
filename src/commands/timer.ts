import type { Arguments, CommandBuilder } from 'yargs';
import type { Config } from '../config';
import { readConfigFile } from '../config';
import { handleError, HarveyError } from '../error';
import { stopTimer } from '../harvest';
import { convertDateInputToISODate, convertMinuteTimeInputToHours } from '../helper';
import {
  pauseActiveTimer,
  printTimerStatus,
  resumePausedTimer,
  startTimer,
  stopRunningTimer,
  updateTimer,
} from '../timer';

type Options = {
  config: string;
  alias?: string;
  note: string;
  date: string;
  action: string;
};

export const command = 'timer <action> [<alias>]';
export const desc = 'Controls a timer.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      note: { type: 'string', alias: 'n', default: '' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
    })
    .positional('alias', { type: 'string', demandOption: false })
    .positional('action', {
      type: 'string',
      demandOption: true,
      choices: ['start', 'stop', 'pause', 'resume', 'update', 'status'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias, note, date, action } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    switch (action) {
      case 'start':
        if (!alias) {
          throw new HarveyError('<alias> is required to start a timer.');
        }
        await startTimer(alias, convertDateInputToISODate(date), note, configuration);
        break;
      case 'stop':
        await stopRunningTimer(configuration);
        break;
      case 'pause':
        await pauseActiveTimer(configuration);
        break;
      case 'resume':
        await resumePausedTimer(configuration);
        break;
      case 'update':
        await updateTimer(convertDateInputToISODate(date), note, configuration);
        break;
      case 'status':
        await printTimerStatus(configuration);
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
