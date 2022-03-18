"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeConfig = exports.defaultConfig = exports.HarveyConfig = void 0;
const cli_output_1 = require("../../cli/cli-output");
const config_1 = require("../../cli/user-input/config");
const harvest_1 = require("../../service/api/harvest");
const config_2 = require("../../service/filesystem/config");
class HarveyConfig {
    constructor() {
        throw new Error("Don't use the constructor of this class. Only use it's static methods.");
    }
    static getConfig() {
        if (!this.config) {
            throw new Error('Global config was never initialised.');
        }
        return this.config;
    }
    static loadConfig(configFilePath) {
        this.config = (0, config_2.readConfigFile)(configFilePath);
        return this.config;
    }
    static setConfig(config) {
        this.config = config;
    }
    static resetConfig() {
        this.config = undefined;
    }
}
exports.HarveyConfig = HarveyConfig;
exports.defaultConfig = {
    accountId: '',
    accessToken: '',
    aliasFilePath: '~/.config/harvey/aliases.json',
    pausedTimerFilePath: '~/.config/harvey/paused_timer.json',
    defaultRoundingInterval: 15,
    fileParser: {
        type: 'xlsx',
        worksheet: 'Timebooking',
        aliasColumn: 'Link',
        minutesColumn: 'Minutes',
    },
};
async function initializeConfig(filePath) {
    return new Promise((resolve) => {
        const newConfig = exports.defaultConfig;
        (0, config_1.askForHarvestAccountId)().then((accountId) => {
            newConfig.accountId = accountId;
            (0, config_1.askForPersonalAccessToken)().then((token) => {
                newConfig.accessToken = token;
                (0, harvest_1.isAccountIdAndTokenValid)(newConfig.accountId, newConfig.accessToken).then((credentialsAreValid) => {
                    if (credentialsAreValid) {
                        (0, config_2.writeConfigFile)(newConfig, filePath);
                        (0, cli_output_1.printMessage)(`Sucessfully generated config "${filePath}".`);
                        resolve();
                    }
                    else {
                        (0, cli_output_1.printMessage)('Could not authenticate, please try again.');
                        initializeConfig(filePath).then(resolve);
                    }
                });
            });
        });
    });
}
exports.initializeConfig = initializeConfig;
