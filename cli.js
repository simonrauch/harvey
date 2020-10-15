#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const args = process.argv.slice(2);

function addAlias(taskAlias) {
    addAliases([taskAlias])
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

function addAliases(aliases) {
    let errors = 0
    const hclAliases = execSync(`hcl aliases`).toString().trim().split(', ');
    const missingAliases = aliases.filter(alias => {
        return !hclAliases.find(hclAlias => hclAlias.includes(alias))
    })

    if (missingAliases.length > 0) {
        const hclTasks = execSync(`hcl tasks`).toString().trim().split(/\r\n|\r|\n/);
        missingAliases.forEach(missingAlias => {
            const filteredHclTasks = hclTasks.filter(task => task.includes(missingAlias))
            if (filteredHclTasks.length < 1) {
                console.log(`HARVEY-ERROR: couldn't create alias ${missingAlias}. Task not found in Harvest.`)
                errors++
            } else if (filteredHclTasks.length > 1) {
                console.log(`HARVEY-ERROR: couldn't create alias ${missingAlias}. Multiple Tasks found. Please create the alias manually with hcl.`)
                errors++
            } else {
                const hclTask = filteredHclTasks[0].split(/\s+/)
                const projectId = hclTask[0]
                const taskId = hclTask[1]
                add(missingAlias, projectId, taskId)
            }
        })
    }

    if (errors > 0) {
        return false
    }

    return true
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
    const aliases = entries.map(entry => entry.task)

    if (addAliases(aliases)) {
        entries.forEach(entry => {
            try {
                const command = `hcl log ${date} @${entry.task} +:${entry.mins} ${comment}`;
                const output = execSync(command).toString().trim();
                hclLog(output)
            } catch {
                console.error(`HARVEY-ERROR: couldn't couldn't log ${entry.task}`)
            }
        })
    } else {
        console.error('HARVEY-ERROR: Aborting! Something went wrong with generating the task aliases. Please sort them out first before retrying.')
    }

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