import type { Arguments, CommandBuilder } from 'yargs';
import { initializeConfig } from '../business/config';
import { handleError } from '../business/error';

export const command = 'init';
export const desc = 'Generate and test a config file.';

type Options = {
  config: string;
};

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config } = argv;

  try {
    await initializeConfig(config);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
