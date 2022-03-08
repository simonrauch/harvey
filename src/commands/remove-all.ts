import type { Arguments, CommandBuilder } from 'yargs';
import { removeAlias, removeAllAliases } from '../alias';
import { Config, readConfigFile } from '../config';
import { handleError } from '../error';

type Options = {
  config: string;
};

export const command = 'remove-all';
export const desc = 'Removes all task references.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    await removeAllAliases(configuration);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
