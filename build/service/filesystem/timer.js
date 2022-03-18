"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPausedTimer = exports.deletePausedTimer = exports.storePausedTimer = void 0;
const _1 = require(".");
const config_1 = require("../../business/config");
function storePausedTimer(timeEntry) {
    const config = config_1.HarveyConfig.getConfig();
    (0, _1.writeToJsonFile)(timeEntry, config.pausedTimerFilePath);
}
exports.storePausedTimer = storePausedTimer;
function deletePausedTimer() {
    const config = config_1.HarveyConfig.getConfig();
    (0, _1.deleteFile)(config.pausedTimerFilePath);
}
exports.deletePausedTimer = deletePausedTimer;
function readPausedTimer() {
    const config = config_1.HarveyConfig.getConfig();
    return (0, _1.readFromJsonFile)(config.pausedTimerFilePath);
}
exports.readPausedTimer = readPausedTimer;
