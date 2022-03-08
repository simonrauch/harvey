import type { Arguments, CommandBuilder } from 'yargs';
import { addAlias } from '../alias';
import type { Config } from '../config';
import { readConfigFile } from '../config';
import { handleError } from '../error';

type Options = {
  config: string;
  alias: string;
};

export const command = 'add <alias>';
export const desc = 'Searches all active harvest tasks names for the alias and will store a reference.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    })
    .positional('alias', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias } = argv;

  try {
    const configuration: Config = readConfigFile(config);
    await addAlias(alias, configuration);
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
