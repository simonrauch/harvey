import type { Arguments, CommandBuilder } from 'yargs';
import { removeAlias } from '../alias';
import { Config, readConfigFile } from '../config';
import { handleError } from '../error';

type Options = {
  config: string;
  alias: string;
};

export const command = 'remove <alias>';
export const desc = 'Removes reference to a task.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    })
    .positional('alias', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { alias, config } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    await removeAlias(alias, configuration);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
