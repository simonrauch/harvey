"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.HarveyFileNotFoundError = exports.HarveyError = void 0;
const cli_output_1 = require("../../cli/cli-output");
class HarveyError extends Error {
}
exports.HarveyError = HarveyError;
class HarveyFileNotFoundError extends HarveyError {
}
exports.HarveyFileNotFoundError = HarveyFileNotFoundError;
function handleError(error) {
    if (error instanceof HarveyError) {
        (0, cli_output_1.printMessage)(`${error.message}`);
    }
    else {
        throw error;
    }
}
exports.handleError = handleError;
