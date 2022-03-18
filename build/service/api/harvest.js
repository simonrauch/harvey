"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAccountIdAndTokenValid = exports.deleteTimeEntry = exports.getMyTimeEntriesPerDate = exports.getAuthenticatedUserId = exports.restartTimeEntry = exports.stopTimeEntry = exports.saveTimeEntry = exports.getRunningTimeEntry = exports.getMyProjectTaskAssignments = exports.getMyProjectAssignments = exports.getHarvestSdk = exports.resetHarvestCache = void 0;
const config_1 = require("../../business/config");
const node_harvest_api_1 = __importDefault(require("node-harvest-api"));
const error_1 = require("../../business/error");
let projectTaskAssignmentCache;
let projectAssignmentCache;
let authenticatedUserIdCache;
let harvestSdk;
function resetHarvestCache() {
    projectTaskAssignmentCache = null;
    projectAssignmentCache = null;
    authenticatedUserIdCache = null;
    harvestSdk = null;
}
exports.resetHarvestCache = resetHarvestCache;
function getHarvestSdk() {
    if (!harvestSdk) {
        const config = config_1.HarveyConfig.getConfig();
        harvestSdk = new node_harvest_api_1.default(config.accountId, config.accessToken, 'harvey');
    }
    return harvestSdk;
}
exports.getHarvestSdk = getHarvestSdk;
async function getMyProjectAssignments(forceFetch = false) {
    return new Promise((resolve) => {
        if (projectAssignmentCache && !forceFetch) {
            resolve(projectAssignmentCache);
        }
        const harvest = getHarvestSdk();
        harvest.users
            .pipe('me')
            .project_assignments.all()
            .then((projectAssignments) => {
            projectAssignmentCache = projectAssignments;
            resolve(projectAssignmentCache);
        });
    });
}
exports.getMyProjectAssignments = getMyProjectAssignments;
async function getMyProjectTaskAssignments(forceFetch = false) {
    return new Promise((resolve) => {
        if (projectTaskAssignmentCache && !forceFetch) {
            resolve(projectTaskAssignmentCache);
        }
        getMyProjectAssignments(forceFetch).then((projectAssignments) => {
            const projectTaskAssignments = [];
            for (const projectAssignment of projectAssignments) {
                for (const taskAssignments of projectAssignment.task_assignments) {
                    projectTaskAssignments.push({
                        project: projectAssignment.project,
                        task: taskAssignments.task,
                    });
                }
            }
            projectTaskAssignmentCache = projectTaskAssignments;
            resolve(projectTaskAssignmentCache);
        });
    });
}
exports.getMyProjectTaskAssignments = getMyProjectTaskAssignments;
async function getRunningTimeEntry() {
    return new Promise((resolve, reject) => {
        const harvest = getHarvestSdk();
        getAuthenticatedUserId().then((userId) => {
            harvest.time_entries.get({ is_running: true, user_id: userId }).then((timeEntries) => {
                if (timeEntries.length > 1) {
                    reject(new error_1.HarveyError('You somehow managed to start multiple time entries. Only one time entry should be running. Please stop them and restart only the correct one.'));
                    return;
                }
                if (timeEntries[0]) {
                    resolve(timeEntries[0]);
                }
                resolve(null);
            });
        });
    });
}
exports.getRunningTimeEntry = getRunningTimeEntry;
async function saveTimeEntry(timeEntry) {
    return new Promise((resolve) => {
        const harvest = getHarvestSdk();
        if (timeEntry.id) {
            harvest.time_entries.update(timeEntry.id, timeEntry).then(resolve);
        }
        else {
            harvest.time_entries.create(timeEntry).then(resolve);
        }
    });
}
exports.saveTimeEntry = saveTimeEntry;
async function stopTimeEntry(timeEntry) {
    return new Promise((resolve) => {
        const harvest = getHarvestSdk();
        if (timeEntry.id) {
            harvest.time_entries.stop(timeEntry.id).then(resolve);
        }
        else {
            resolve(timeEntry);
        }
    });
}
exports.stopTimeEntry = stopTimeEntry;
async function restartTimeEntry(timeEntry) {
    return new Promise((resolve) => {
        const harvest = getHarvestSdk();
        if (timeEntry.id) {
            harvest.time_entries.restart(timeEntry.id).then(resolve);
        }
        else {
            resolve(timeEntry);
        }
    });
}
exports.restartTimeEntry = restartTimeEntry;
async function getAuthenticatedUserId() {
    return new Promise((resolve) => {
        if (authenticatedUserIdCache) {
            resolve(authenticatedUserIdCache);
        }
        const harvest = getHarvestSdk();
        harvest.users.me().then((user) => {
            authenticatedUserIdCache = user.id;
            resolve(authenticatedUserIdCache);
        });
    });
}
exports.getAuthenticatedUserId = getAuthenticatedUserId;
async function getMyTimeEntriesPerDate(date) {
    return new Promise((resolve) => {
        const harvest = getHarvestSdk();
        getAuthenticatedUserId().then((userId) => {
            harvest.time_entries.get({ from: date, to: date, user_id: userId }).then(resolve);
        });
    });
}
exports.getMyTimeEntriesPerDate = getMyTimeEntriesPerDate;
async function deleteTimeEntry(timeEntry) {
    return new Promise((resolve) => {
        const harvest = getHarvestSdk();
        if (!timeEntry.id) {
            throw new Error('id property has to be set, to delete a time entry.');
        }
        harvest.time_entries.delete(timeEntry.id).then(resolve);
    });
}
exports.deleteTimeEntry = deleteTimeEntry;
async function isAccountIdAndTokenValid(accountId, token) {
    return new Promise((resolve) => {
        const harvest = new node_harvest_api_1.default(accountId, token, 'harvey');
        harvest.users
            .me()
            .then((user) => {
            if (user.first_name) {
                resolve(true);
                return;
            }
            resolve(false);
            return;
        })
            .catch(() => {
            resolve(false);
            return;
        });
    });
}
exports.isAccountIdAndTokenValid = isAccountIdAndTokenValid;
