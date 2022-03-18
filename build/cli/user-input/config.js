"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askForPersonalAccessToken = exports.askForHarvestAccountId = void 0;
const _1 = require(".");
async function askForHarvestAccountId() {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Please enter your harvest account id: ', (account_id) => {
            rl.close();
            resolve(account_id);
        });
    });
}
exports.askForHarvestAccountId = askForHarvestAccountId;
async function askForPersonalAccessToken() {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Please enter your personal access token: ', (token) => {
            rl.close();
            resolve(token);
        });
    });
}
exports.askForPersonalAccessToken = askForPersonalAccessToken;
