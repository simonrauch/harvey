import type { Arguments, CommandBuilder } from 'yargs';
import { addAlias, removeAlias, removeAllAliases } from '../../business/alias';
import { HarveyConfig } from '../../business/config';
import { handleError, HarveyError } from '../../business/error';

type Options = {
  config: string;
  alias?: string;
  search?: string;
  action: string;
};

export const command = 'alias <action> [<alias>]';
export const desc = 'Manages Harvey aliases.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      search: { type: 'string', alias: 's' },
      config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    })
    .positional('alias', { type: 'string', demandOption: false })
    .positional('action', {
      type: 'string',
      demandOption: true,
      choices: ['add', 'remove', 'remove-all'],
    });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, alias, action, search } = argv;

  try {
    HarveyConfig.loadConfig(config);
    switch (action) {
      case 'add':
        if (!alias) {
          throw new HarveyError('<alias> is required to add an alias.');
        }
        await addAlias(alias, search);
        break;
      case 'remove':
        if (!alias) {
          throw new HarveyError('<alias> is required to remove an alias.');
        }
        await removeAlias(alias);
        break;
      case 'remove-all':
        await removeAllAliases();
        break;
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }

  process.exit(0);
};
