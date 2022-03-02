import type { Arguments, CommandBuilder } from 'yargs';
import { removeAlias, removeAllAliases } from '../alias';
import { handleError } from '../error';

type Options = {
    aliases: string;
};

export const command: string = 'remove-all';
export const desc: string = 'Removes all task references.';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            aliases: { type: 'string', alias: 'a', default: '~/.config/harvey/aliases.json' },
        });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const { aliases } = argv;

    try {
        await removeAllAliases(aliases);
    } catch (error) {
        handleError(error);
        process.exit(1);
    }

    process.exit(0);
};