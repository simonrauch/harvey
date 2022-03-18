"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const config_1 = require("../../business/config");
const error_1 = require("../../business/error");
const parser_1 = require("../../business/parser");
const user_input_1 = require("../user-input");
exports.command = 'parse <file>';
exports.desc = 'Creates a harvest time entry.';
const builder = (yargs) => yargs
    .options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    note: { type: 'string', alias: 'n', default: '' },
    date: { type: 'string', alias: 'd', default: (0, user_input_1.parseUserDateInput)() },
})
    .positional('file', { type: 'string', demandOption: true });
exports.builder = builder;
const handler = async (argv) => {
    const { config, file, note, date } = argv;
    try {
        config_1.HarveyConfig.loadConfig(config);
        await (0, parser_1.parseFileAndBookEntries)(file, (0, user_input_1.parseUserDateInput)(date), note);
    }
    catch (error) {
        (0, error_1.handleError)(error);
        process.exit(1);
    }
    process.exit(0);
};
exports.handler = handler;
