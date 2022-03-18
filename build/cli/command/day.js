"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const config_1 = require("../../business/config");
const day_1 = require("../../business/day");
const error_1 = require("../../business/error");
const user_input_1 = require("../user-input");
exports.command = 'day [<action>]';
exports.desc = 'Controls the time entries of a day.';
const builder = (yargs) => yargs
    .options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    date: { type: 'string', alias: 'd', default: (0, user_input_1.parseUserDateInput)() },
    rounding_interval: { type: 'number', alias: 'ri' },
})
    .positional('action', {
    type: 'string',
    default: 'status',
    choices: ['status', 'modify', 'round'],
});
exports.builder = builder;
const handler = async (argv) => {
    const { config, date, action, rounding_interval } = argv;
    try {
        config_1.HarveyConfig.loadConfig(config);
        const configuration = config_1.HarveyConfig.getConfig();
        switch (action) {
            case 'status':
                await (0, day_1.printDay)((0, user_input_1.parseUserDateInput)(date));
                break;
            case 'round':
                await (0, day_1.roundDay)((0, user_input_1.parseUserDateInput)(date), rounding_interval ?? configuration.defaultRoundingInterval);
                await (0, day_1.printDay)((0, user_input_1.parseUserDateInput)(date));
                break;
            case 'modify':
                await (0, day_1.modifyDay)((0, user_input_1.parseUserDateInput)(date), rounding_interval ?? configuration.defaultRoundingInterval);
                await (0, day_1.printDay)((0, user_input_1.parseUserDateInput)(date));
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
