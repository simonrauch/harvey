"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const alias_1 = require("../../business/alias");
const config_1 = require("../../business/config");
const error_1 = require("../../business/error");
exports.command = 'alias <action> [<alias>]';
exports.desc = 'Manages Harvey aliases.';
const builder = (yargs) => yargs
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
exports.builder = builder;
const handler = async (argv) => {
    const { config, alias, action, search } = argv;
    try {
        config_1.HarveyConfig.loadConfig(config);
        switch (action) {
            case 'add':
                if (!alias) {
                    throw new error_1.HarveyError('<alias> is required to add an alias.');
                }
                await (0, alias_1.addAlias)(alias, search);
                break;
            case 'remove':
                if (!alias) {
                    throw new error_1.HarveyError('<alias> is required to remove an alias.');
                }
                await (0, alias_1.removeAlias)(alias);
                break;
            case 'remove-all':
                await (0, alias_1.removeAllAliases)();
                break;
        }
    }
    catch (error) {
        (0, error_1.handleError)(error);
        process.exit(1);
    }
    process.exit(0);
};
exports.handler = handler;
