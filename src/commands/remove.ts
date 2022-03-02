import type { Arguments, CommandBuilder } from 'yargs';
import { removeAlias } from '../alias';
import { handleError } from '../error';

type Options = {
    aliases: string;
    alias: string;
};

export const command: string = 'remove <alias>';
export const desc: string = 'Removes reference to a task.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            aliases: { type: 'string', alias: 'a', default: '~/.config/harvey/aliases.json' },
        })
        .positional('alias', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const { alias, aliases } = argv;

    try {
        await removeAlias(alias, aliases);
    } catch (error) {
        handleError(error);
        process.exit(1);
    }

    process.exit(0);
};