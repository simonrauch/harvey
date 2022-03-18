"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const config_1 = require("../../business/config");
const error_1 = require("../../business/error");
const timer_1 = require("../../business/timer");
const user_input_1 = require("../user-input");
exports.command = 'timer [<action>] [<alias>]';
exports.desc = 'Controls a timer.';
const builder = (yargs) => yargs
    .options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    note: { type: 'string', alias: 'n' },
    date: { type: 'string', alias: 'd', describe: 'timers date, format: "YYYY-MM-DD"' },
    add: { type: 'string', alias: 'a' },
    subtract: { type: 'string', alias: 's' },
    round: { type: 'boolean', alias: 'r', default: false },
    rounding_interval: { type: 'number', alias: 'ri' },
})
    .positional('alias', { type: 'string', demandOption: false })
    .positional('action', {
    type: 'string',
    default: 'status',
    choices: ['start', 'stop', 'pause', 'resume', 'update', 'status'],
});
exports.builder = builder;
const handler = async (argv) => {
    const { config, alias, note, date, action, add, subtract, round, rounding_interval } = argv;
    try {
        const configuration = config_1.HarveyConfig.loadConfig(config);
        switch (action) {
            case 'start':
                if (!alias) {
                    throw new error_1.HarveyError('<alias> is required to start a timer.');
                }
                await (0, timer_1.startTimer)(alias, date ? (0, user_input_1.parseUserDateInput)(date) : (0, user_input_1.parseUserDateInput)(), note ?? '');
                await (0, timer_1.showTimer)();
                break;
            case 'stop':
                await (0, timer_1.stopRunningTimer)(round, rounding_interval ?? configuration.defaultRoundingInterval);
                await (0, timer_1.showTimer)();
                break;
            case 'pause':
                await (0, timer_1.pauseActiveTimer)();
                await (0, timer_1.showTimer)();
                break;
            case 'resume':
                await (0, timer_1.resumePausedTimer)();
                await (0, timer_1.showTimer)();
                break;
            case 'update':
                await (0, timer_1.updateTimer)(date ? (0, user_input_1.parseUserDateInput)(date) : null, note ?? null, add ? (0, user_input_1.parseUserTimeInput)(add) : null, subtract ? (0, user_input_1.parseUserTimeInput)(subtract) : null, round, rounding_interval ?? configuration.defaultRoundingInterval);
                await (0, timer_1.showTimer)();
                break;
            case 'status':
                await (0, timer_1.showTimer)();
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
