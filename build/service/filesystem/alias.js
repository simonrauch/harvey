"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAliasFile = exports.readAliasFile = void 0;
const _1 = require(".");
const config_1 = require("../../business/config");
function readAliasFile() {
    const filePath = config_1.HarveyConfig.getConfig().aliasFilePath;
    if (!(0, _1.fileExists)(filePath)) {
        writeAliasFile(new Map());
    }
    return new Map((0, _1.readFromJsonFile)(filePath));
}
exports.readAliasFile = readAliasFile;
function writeAliasFile(aliases) {
    const filePath = config_1.HarveyConfig.getConfig().aliasFilePath;
    (0, _1.writeToJsonFile)(Array.from(aliases.entries()), filePath);
}
exports.writeAliasFile = writeAliasFile;
