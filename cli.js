#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const args = process.argv.slice(2);

function addAlias(taskAlias) {
    let taskDetailsLines = 0
    let taskAliasesLines = 0
    let taskDetails

    try {
        taskDetails = execSync(`hcl tasks | grep ${taskAlias}`).toString().trim();
        taskDetailsLines = taskDetails.split(/\r\n|\r|\n/).length;
    } catch { }

    try {
        taskAliasesLines = execSync(`hcl aliases | grep ${taskAlias}`).toString().trim().length;
    } catch { }

    if (taskDetailsLines == 1 && taskAliasesLines == 0) {
        const detailsArray = taskDetails.split(/\s+/);
        const projectId = detailsArray[0];
        const taskId = detailsArray[1];
        try {
            const output = execSync(`hcl alias ${taskAlias} ${projectId} ${taskId}`).toString().trim();
            hclLog(output);
        } catch {
            console.log(`HARVEY-ERROR: couldn't create alias ${taskAlias}`)
        }
    } else if (taskDetailsLines == 0 && taskAliasesLines != 0) {
        console.log(`HARVEY-ERROR: task ${taskAlias} not found`);
        return false;
    } else if (taskDetailsLines > 1) {
        console.log(`HARVEY-ERROR: multiple tasks for ${taskAlias} found, can't decide.`);
        return false;
    }
    return true;
}

function remove(taskAlias) {
    const output = execSync(`hcl unalias ${taskAlias}`).toString().trim();
    hclLog(output)
}

function parseCsvFile(file) {
    const csvRows = fs.readFileSync(file, 'UTF-8').trim().split(/\r\n|\r|\n/);
    let entries = [];
    csvRows.forEach(csvRow => {
        let csvCells = csvRow.split(';')
        entries.push({
            task: csvCells[0],
            mins: csvCells[csvCells.length - 1]
        })
    })
    return entries
}

function addAliasesForEntries(entries) {
    const hclAliases = execSync(`hcl aliases`).toString().trim().split(', ');
    const missingAliases = entries.filter(entry => {
        return !hclAliases.find(hclAlias => hclAlias.includes(entry.task))
    })

    if (missingAliases.length > 0) {
        const hclTasks = execSync(`hcl tasks`).toString().trim().split(/\r\n|\r|\n/);
        missingAliases.forEach(missingAlias => {
            const hclTask = hclTasks.find(task => task.includes(missingAlias.task)).split(/\s+/)
            const projectId = hclTask[0]
            const taskId = hclTask[1]
            add(missingAlias.task, projectId, taskId)
        })
    }

}

function add(alias, projectId, taskId) {
    try {
        const output = execSync(`hcl alias ${alias} ${projectId} ${taskId}`).toString().trim();
        hclLog(output);
    } catch {
        console.log(`HARVEY-ERROR: couldn't create alias ${alias}`)
    }
}

function parse(file, date, comment) {
    date = (date) ? date : ""
    comment = (comment) ? comment : ""
    const entries = parseCsvFile(file)
    addAliasesForEntries(entries)

    entries.forEach(entry => {
        try {
            const command = `hcl log ${date} @${entry.task} +:${entry.mins} ${comment}`;
            const output = execSync(command).toString().trim();
            hclLog(output)
        } catch {
            console.error(`HARVEY-ERROR: couldn't couldn't log ${entry.task}`)
        }
    })
}

function compain() {
    console.error('HARVEY-ERROR: unclear instructions... ¯\\_(ツ)_/¯');
}

function hclLog(log) {
    console.log(`HCL-LOG: ${log}`)
}

switch (args[0]) {
    case 'add':
        (args[1]) ? addAlias(args[1]) : compain();
        break;
    case 'remove':
        (args[1]) ? remove(args[1]) : compain();
        break;
    case 'parse':
        (args[1]) ? parse(args[1], args[2], args[3]) : compain();
        break;
    default:
        compain();
}