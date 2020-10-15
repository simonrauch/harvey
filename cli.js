#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const args = process.argv.slice(2);

function addAction(taskAlias) {
    addAliases([taskAlias])
}

function removeAction(taskAlias) {
    verboseHclQuery(`unalias ${taskAlias}`)
}

function parseAction(file, date, comment) {
    date = (date) ? date : ""
    comment = (comment) ? comment : ""
    const entries = parseCsvFile(file)
    const aliases = entries.map(entry => entry.task)

    if (addAliases(aliases)) {
        entries.forEach(entry => {
            try {
                verboseHclQuery(`log ${date} @${entry.task} +:${entry.mins} ${comment}`);
            } catch {
                harveyError(`Couldn't couldn't log ${entry.task}.`)
            }
        })
    } else {
        harveyError('Aborting! Something went wrong with generating the task aliases. Please sort them out first before retrying.')
    }

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
    const hclAliases = hclQuery('aliases').split(', ');
    const missingAliases = aliases.filter(alias => {
        return !hclAliases.find(hclAlias => hclAlias.includes(alias))
    })

    if (missingAliases.length > 0) {
        const hclTasks = hclQuery('hcl tasks').split(/\r\n|\r|\n/);
        missingAliases.forEach(missingAlias => {
            const filteredHclTasks = hclTasks.filter(task => task.includes(missingAlias))
            if (filteredHclTasks.length < 1) {
                harveyError(`Couldn't create alias ${missingAlias}. Task not found in Harvest.`)
                errors++
            } else if (filteredHclTasks.length > 1) {
                harveyError(`Couldn't create alias ${missingAlias}. Multiple Tasks found. Please create the alias manually with hcl.`)
                errors++
            } else {
                const hclTask = filteredHclTasks[0].split(/\s+/)
                add(missingAlias, hclTask[0], hclTask[1])
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
        verboseHclQuery(`alias ${alias} ${projectId} ${taskId}`)
    } catch {
        harveyError(`Couldn't create alias ${alias}.`)
    }
}

function compain() {
    harveyError('Unclear instructions... ¯\\_(ツ)_/¯');
}

function hclQuery(qry) {
    return execSync(`hcl ${qry}`).toString().trim();
}

function verboseHclQuery(qry) {
    const result = hclQuery(qry)
    hclLog(result)
    return result
}

function hclLog(log) {
    console.log(`HCL-LOG: ${log}`)
}
function harveyError(log) {
    console.log(`HARVEY-ERROR: ${log}`)
}

switch (args[0]) {
    case 'add':
        (args[1]) ? addAction(args[1]) : compain();
        break;
    case 'remove':
        (args[1]) ? removeAction(args[1]) : compain();
        break;
    case 'parse':
        (args[1]) ? parseAction(args[1], args[2], args[3]) : compain();
        break;
    default:
        compain();
}