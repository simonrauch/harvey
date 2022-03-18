"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeConfigFile = exports.readConfigFile = void 0;
const _1 = require(".");
function readConfigFile(filePath) {
    if (!(0, _1.fileExists)(filePath)) {
        throw new Error(`No config file found at "${filePath}". Please create one, by running the init command`);
    }
    return (0, _1.readFromJsonFile)(filePath);
}
exports.readConfigFile = readConfigFile;
function writeConfigFile(config, filePath) {
    (0, _1.writeToJsonFile)(config, filePath);
}
exports.writeConfigFile = writeConfigFile;
