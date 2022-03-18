"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const alias_1 = require("../../business/alias");
const config_1 = require("../../business/config");
const error_1 = require("../../business/error");
const harvest_1 = require("../../service/api/harvest");
const user_input_1 = require("../user-input");
exports.command = 'book <alias> <time>';
exports.desc = 'Creates a harvest time entry.';
const builder = (yargs) => yargs
    .options({
    config: { type: 'string', alias: 'c', default: '~/.config/harvey/config.json' },
    note: { type: 'string', alias: 'n', default: '' },
    date: { type: 'string', alias: 'd', default: (0, user_input_1.parseUserDateInput)() },
})
    .positional('alias', { type: 'string', demandOption: true })
    .positional('time', { type: 'string', demandOption: true });
exports.builder = builder;
const handler = async (argv) => {
    const { config, alias, note, date, time } = argv;
    try {
        config_1.HarveyConfig.loadConfig(config);
        const harvestAlias = await (0, alias_1.getAliasOrCreate)(alias);
        const timeEntry = {
            task_id: harvestAlias.idTask,
            project_id: harvestAlias.idProject,
            hours: (0, user_input_1.parseUserTimeInput)(time),
            notes: note,
            spent_date: (0, user_input_1.parseUserDateInput)(date),
        };
        await (0, harvest_1.saveTimeEntry)(timeEntry);
    }
    catch (error) {
        (0, error_1.handleError)(error);
        process.exit(1);
    }
    process.exit(0);
};
exports.handler = handler;
