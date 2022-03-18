"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.writeToJsonFile = exports.readFromJsonFile = exports.fileExists = exports.transformPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const error_1 = require("../../business/error");
function transformPath(filePath) {
    return filePath.replace('~', (0, os_1.homedir)());
}
exports.transformPath = transformPath;
function fileExists(filePath) {
    filePath = transformPath(filePath);
    return fs_1.default.existsSync(filePath);
}
exports.fileExists = fileExists;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readFromJsonFile(filePath) {
    if (!fileExists(filePath)) {
        return null;
    }
    filePath = transformPath(filePath);
    const fileContent = fs_1.default.readFileSync(filePath).toString();
    try {
        return JSON.parse(fileContent);
    }
    catch (error) {
        throw new error_1.HarveyError(`JSON file "${filePath}" is not in a valid JSON format.`);
    }
}
exports.readFromJsonFile = readFromJsonFile;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function writeToJsonFile(content, filePath, pretty = false) {
    filePath = transformPath(filePath);
    if (!fs_1.default.existsSync(path_1.default.dirname(filePath))) {
        fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
    }
    fs_1.default.writeFileSync(filePath, JSON.stringify(content, null, pretty ? 2 : undefined), 'utf8');
}
exports.writeToJsonFile = writeToJsonFile;
function deleteFile(filePath) {
    filePath = transformPath(filePath);
    if (fileExists(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
}
exports.deleteFile = deleteFile;
