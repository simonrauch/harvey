"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askToChooseTaskProjectAssignmentForAliasing = void 0;
const _1 = require(".");
const cli_output_1 = require("../cli-output");
async function askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments) {
    return new Promise((resolve) => {
        const rl = (0, _1.createReadlineInterface)();
        rl.question('Please choose one, by entering the according number: ', function (numberEntered) {
            rl.close();
            const index = Number(numberEntered);
            if (isNaN(index)) {
                (0, cli_output_1.printMessage)(`${index} is not a number. Please try again.`);
                askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
            }
            else if (!projectTaskAssignments[index]) {
                (0, cli_output_1.printMessage)(`${index} is not a valid option. Please try again.`);
                askToChooseTaskProjectAssignmentForAliasing(projectTaskAssignments).then(resolve);
            }
            else {
                resolve(projectTaskAssignments[index]);
            }
        });
    });
}
exports.askToChooseTaskProjectAssignmentForAliasing = askToChooseTaskProjectAssignmentForAliasing;
