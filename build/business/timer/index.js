"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopRunningTimer = exports.updateTimer = exports.startTimer = exports.resumePausedTimer = exports.pauseActiveTimer = exports.showTimer = exports.HarveyTimerStatus = void 0;
const alias_1 = require("../alias");
const error_1 = require("../error");
const harvest_1 = require("../../service/api/harvest");
const timer_1 = require("../../cli/cli-output/timer");
const round_1 = require("../round");
const timer_2 = require("../../service/filesystem/timer");
var HarveyTimerStatus;
(function (HarveyTimerStatus) {
    HarveyTimerStatus[HarveyTimerStatus["stopped"] = 0] = "stopped";
    HarveyTimerStatus[HarveyTimerStatus["running"] = 1] = "running";
    HarveyTimerStatus[HarveyTimerStatus["paused"] = 2] = "paused";
})(HarveyTimerStatus = exports.HarveyTimerStatus || (exports.HarveyTimerStatus = {}));
async function showTimer() {
    return new Promise((resolve) => {
        const pausedTimer = getPausedTimer();
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            if (!pausedTimer && !activeTimer) {
                (0, timer_1.printTimer)({ status: HarveyTimerStatus.stopped });
            }
            else if (activeTimer) {
                (0, timer_1.printTimer)({ status: HarveyTimerStatus.running, timeEntry: activeTimer });
            }
            else if (pausedTimer) {
                (0, timer_1.printTimer)({ status: HarveyTimerStatus.paused, timeEntry: pausedTimer });
            }
            resolve();
        });
    });
}
exports.showTimer = showTimer;
async function pauseActiveTimer() {
    return new Promise((resolve) => {
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            if (!activeTimer) {
                throw new error_1.HarveyError('No active timer to pause.');
            }
            (0, harvest_1.stopTimeEntry)(activeTimer).then((stoppedTimer) => {
                (0, timer_2.storePausedTimer)(stoppedTimer);
                resolve();
            });
        });
    });
}
exports.pauseActiveTimer = pauseActiveTimer;
function resumePausedTimer() {
    return new Promise((resolve) => {
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            const pausedTimer = (0, timer_2.readPausedTimer)();
            if (!activeTimer && !pausedTimer) {
                throw new error_1.HarveyError('No paused timer to resume available.');
            }
            if (activeTimer) {
                (0, timer_2.deletePausedTimer)();
                resolve();
            }
            if (pausedTimer) {
                (0, harvest_1.restartTimeEntry)(pausedTimer).then(() => {
                    (0, timer_2.deletePausedTimer)();
                    resolve();
                });
            }
        });
    });
}
exports.resumePausedTimer = resumePausedTimer;
function startTimer(alias, date, note) {
    return new Promise((resolve) => {
        (0, timer_2.deletePausedTimer)();
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            if (activeTimer) {
                throw new error_1.HarveyError('Timer already running. Please stop it, before starting a new one.');
            }
            (0, alias_1.getAliasOrCreate)(alias).then((aliasEntry) => {
                (0, harvest_1.saveTimeEntry)({
                    project_id: aliasEntry.idProject,
                    task_id: aliasEntry.idTask,
                    hours: 0,
                    notes: note,
                    spent_date: date,
                    is_running: true,
                }).then(() => {
                    resolve();
                });
            });
        });
    });
}
exports.startTimer = startTimer;
function updateTimer(date, note, addHours, subtractHours, round, roundingInterval) {
    return new Promise((resolve, reject) => {
        const hourDiff = getHourTimeDiff(addHours ?? 0, subtractHours ?? 0);
        if (hourDiff !== 0 && round) {
            reject(new error_1.HarveyError('Rounding and adding/subtracting are exclusive timer actions. Please only use one.'));
            return;
        }
        const promises = [
            updateRunningTimer(date, note, hourDiff, round ?? false, roundingInterval),
            updatePausedTimer(date, note, hourDiff, round ?? false, roundingInterval),
        ];
        Promise.all(promises)
            .then(() => {
            resolve();
        })
            .catch((error) => {
            reject(error);
        });
    });
}
exports.updateTimer = updateTimer;
function getHourTimeDiff(addHours, subtractHours) {
    return addHours - subtractHours;
}
function setHourTimeDiffOnTimeEntry(timeEntry, hourDiff) {
    const newHours = timeEntry.hours + hourDiff;
    if (newHours < 0) {
        throw new error_1.HarveyError('Cannot set time entries new to time to a value below 0.');
    }
    if (newHours > 24) {
        throw new error_1.HarveyError('Cannot set time entries new to time to a value above 24h.');
    }
    timeEntry.hours = newHours;
    return timeEntry;
}
async function updateRunningTimer(date, note, hourDiff, round, roundingInterval) {
    return new Promise((resolve, reject) => {
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            if (activeTimer) {
                try {
                    activeTimer = setUpdatesOnTimeEntry(activeTimer, date, note, hourDiff, round, roundingInterval);
                }
                catch (error) {
                    reject(error);
                    return;
                }
                (0, harvest_1.saveTimeEntry)(activeTimer)
                    .then(() => resolve())
                    .catch(reject);
            }
            else {
                resolve();
            }
        });
    });
}
async function updatePausedTimer(date, note, hourDiff, round, roundingInterval) {
    return new Promise((resolve, reject) => {
        let pausedTimer = (0, timer_2.readPausedTimer)();
        if (pausedTimer) {
            try {
                pausedTimer = setUpdatesOnTimeEntry(pausedTimer, date, note, hourDiff, round, roundingInterval);
            }
            catch (error) {
                reject(error);
                return;
            }
            (0, harvest_1.saveTimeEntry)(pausedTimer)
                .then((updatedTimer) => {
                (0, timer_2.storePausedTimer)(updatedTimer);
                resolve();
            })
                .catch(reject);
        }
        else {
            resolve();
        }
    });
}
function setUpdatesOnTimeEntry(timeEntry, date, note, hourDiff, round, roundingInterval) {
    if (date)
        timeEntry.spent_date = date;
    if (note)
        timeEntry.notes = note;
    if (round) {
        timeEntry = (0, round_1.roundTimeEntry)(timeEntry, roundingInterval);
    }
    timeEntry = setHourTimeDiffOnTimeEntry(timeEntry, hourDiff);
    return timeEntry;
}
function stopRunningTimer(round, roundingInterval) {
    return new Promise((resolve) => {
        (0, harvest_1.getRunningTimeEntry)().then((activeTimer) => {
            (0, timer_2.deletePausedTimer)();
            if (activeTimer) {
                (0, harvest_1.stopTimeEntry)(activeTimer).then((stoppedTimer) => {
                    if (round) {
                        stoppedTimer = (0, round_1.roundTimeEntry)(stoppedTimer, roundingInterval);
                        (0, harvest_1.saveTimeEntry)(stoppedTimer).then(() => resolve());
                    }
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    });
}
exports.stopRunningTimer = stopRunningTimer;
function getPausedTimer() {
    return (0, timer_2.readPausedTimer)();
}
