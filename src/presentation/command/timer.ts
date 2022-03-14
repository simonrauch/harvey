import type { Arguments, CommandBuilder } from 'yargs';
import { HarveyConfig } from '../../business/config';
import { handleError, HarveyError } from '../../business/error';
import { convertDateInputToISODate } from '../../business/helper';
import {
  pauseActiveTimer,
  showTimer,
  resumePausedTimer,
  startTimer,
  stopRunningTimer,
  updateTimer,
} from '../../business/timer';

type Options = {
  config: string;
  alias?: string;
  note: string;
  date: string;
  action: string;
  add: number;
  subtract: number;
};

export const command = 'timer [<action>] [<alias>]';
export const desc = 'Controls a timer.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
      note: { type: 'string', alias: 'n', default: '' },
      date: { type: 'string', alias: 'd', default: convertDateInputToISODate() },
      add: { type: 'number', alias: 'a', default: 0 },
      subtract: { type: 'number', alias: 's', default: 0 },
    })
    .positional('alias', { type: 'string', demandOption: false })
    .positional('action', {
      type: 'string',
      default: 'status',
      choices: ['start', 'stop', 'pause', 'resume', 'update', 'status'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias, note, date, action, add, subtract } = argv;

  try {
    HarveyConfig.loadConfig(config);
    switch (action) {
      case 'start':
        if (!alias) {
          throw new HarveyError('<alias> is required to start a timer.');
        }
        await startTimer(alias, convertDateInputToISODate(date), note);
        await showTimer();
        break;
      case 'stop':
        await stopRunningTimer();
        await showTimer();
        break;
      case 'pause':
        await pauseActiveTimer();
        await showTimer();
        break;
      case 'resume':
        await resumePausedTimer();
        await showTimer();
        break;
      case 'update':
        await updateTimer(convertDateInputToISODate(date), note, add, subtract);
        await showTimer();
        break;
      case 'status':
        await showTimer();
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
