"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const config_1 = require("../../business/config");
const error_1 = require("../../business/error");
exports.command = 'init';
exports.desc = 'Generate and test a config file.';
const builder = (yargs) => yargs.options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
});
exports.builder = builder;
const handler = async (argv) => {
    const { config } = argv;
    try {
        await (0, config_1.initializeConfig)(config);
    }
    catch (error) {
        (0, error_1.handleError)(error);
        process.exit(1);
    }
    process.exit(0);
};
exports.handler = handler;
