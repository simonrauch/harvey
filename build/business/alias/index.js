"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllAliases = exports.removeAlias = exports.getAliasOrCreate = exports.addAlias = void 0;
const harvest_1 = require("../../service/api/harvest");
const error_1 = require("../error");
const alias_1 = require("../../service/filesystem/alias");
const alias_2 = require("../../cli/user-input/alias");
const cli_output_1 = require("../../cli/cli-output");
class AliasNotFoundError extends error_1.HarveyError {
}
async function addAlias(aliasKey, searchString) {
    return new Promise((resolve) => {
        const aliasSearchTerm = searchString ?? aliasKey;
        (0, harvest_1.getMyProjectTaskAssignments)().then((projectTaskAssignments) => {
            const filteredProjectTaskAssignments = projectTaskAssignments.filter((projectTaskAssignment) => {
                return projectTaskAssignment.task.name.includes(aliasSearchTerm);
            });
            if (filteredProjectTaskAssignments.length === 0) {
                throw new Error(`Task "${aliasSearchTerm}" was not found.`);
            }
            if (filteredProjectTaskAssignments.length > 10) {
                throw new Error(`Too many tasks for "${aliasSearchTerm}" were found. Please use a more specific alias.`);
            }
            findSingleProjectTaskAssignment(aliasKey, filteredProjectTaskAssignments).then((projectTaskAssignment) => {
                const alias = mapProjectTaskAssignmentToAlias(aliasKey, projectTaskAssignment);
                storeAlias(alias);
                resolve(alias);
            });
        });
    });
}
exports.addAlias = addAlias;
async function getAliasOrCreate(aliasKey) {
    return new Promise((resolve) => {
        try {
            const alias = getAlias(aliasKey);
            resolve(alias);
        }
        catch (error) {
            if (!(error instanceof AliasNotFoundError)) {
                throw error;
            }
            addAlias(aliasKey).then(resolve);
        }
    });
}
exports.getAliasOrCreate = getAliasOrCreate;
function getAlias(aliasKey) {
    const alias = (0, alias_1.readAliasFile)().get(aliasKey);
    if (!alias) {
        throw new AliasNotFoundError();
    }
    return alias;
}
function removeAlias(aliasKey) {
    const aliases = (0, alias_1.readAliasFile)();
    if (!aliases.has(aliasKey)) {
        throw new Error(`"${aliasKey}" was not found. Nothing to remove.`);
    }
    aliases.delete(aliasKey);
    (0, alias_1.writeAliasFile)(aliases);
}
exports.removeAlias = removeAlias;
function removeAllAliases() {
    (0, alias_1.writeAliasFile)(new Map());
}
exports.removeAllAliases = removeAllAliases;
async function findSingleProjectTaskAssignment(aliasKey, projectTaskAssignments) {
    return new Promise((resolve) => {
        if (projectTaskAssignments.length == 1) {
            resolve(projectTaskAssignments[0]);
            return;
        }
        (0, cli_output_1.printMessage)(`Multiple tasks for "${aliasKey}" were found:`);
        projectTaskAssignments.forEach((projectTaskAssignment, index) => {
            (0, cli_output_1.printMessage)(`${index} - ${projectTaskAssignment.task.name} (${projectTaskAssignment.project.name})`);
        });
        (0, alias_2.askToChooseTaskProjectAssignmentForAliasing)(projectTaskAssignments).then(resolve);
    });
}
function mapProjectTaskAssignmentToAlias(aliasKey, projectTaskAssignment) {
    return {
        alias: aliasKey,
        idProject: projectTaskAssignment.project.id,
        idTask: projectTaskAssignment.task.id,
    };
}
function storeAlias(alias) {
    const aliases = (0, alias_1.readAliasFile)();
    aliases.set(alias.alias, alias);
    (0, alias_1.writeAliasFile)(aliases);
}
