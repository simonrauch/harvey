import { homedir } from "os";
import fs from 'fs';
import type { Config } from "../config";
import path from 'path';
import { getAllProjectTaskAssignments } from "../harvest";
import { createInterface as createReadlineInterface } from 'readline';

export interface Alias {
    alias: string;
    idProject: number;
    idTask: number;
} 

export async function addAlias(aliasKey: string, config: Config, aliasFilePath: string): Promise<void> {
    const projectTaskAssignments = await getAllProjectTaskAssignments(config);
    let filteredProjectTaskAssignments = projectTaskAssignments.filter((projectTaskAssignment: HarvestProjectTaskAssignment) => {
        return projectTaskAssignment.task.name.includes(aliasKey);
    })

    if(filteredProjectTaskAssignments.length === 0) {
        throw new Error(`Task "${aliasKey}" was not found.`)
    }

    if(filteredProjectTaskAssignments.length > 10) {
        throw new Error(`Too many tasks for "${aliasKey}" were found. Please use a more specific alias.`)
    }

    const projectTaskAssignment = await findSingleProjectTaskAssignment(aliasKey, filteredProjectTaskAssignments);
    const alias = mapProjectTaskAssignmentToAlias(aliasKey, projectTaskAssignment);

    storeAlias(alias, aliasFilePath);
}


export function removeAlias(aliasKey: string, aliasFilePath: string): void {
    let aliases = readAliasFile(aliasFilePath);

    if(!aliases.has(aliasKey)) {
        throw new Error(`"${aliasKey}" was not found. Nothing to remove.`)
    }

    aliases.delete(aliasKey)

    writeAliasFile(aliases, aliasFilePath);
}

export function removeAllAliases(aliasFilePath: string): void {
    writeAliasFile(new Map(), aliasFilePath);
}

async function findSingleProjectTaskAssignment(aliasKey: string, projectTaskAssignments: Array<HarvestProjectTaskAssignment>): Promise<HarvestProjectTaskAssignment>
{
    return new Promise(resolve => {
        if(projectTaskAssignments.length == 1) {
            resolve(projectTaskAssignments[0]);
        }

        process.stdout.write(`Multiple tasks for "${aliasKey}" were found: \n`);

        const rl = createReadlineInterface({
            input: process.stdin,
            output: process.stdout
        });

        projectTaskAssignments.forEach((projectTaskAssignment, index) => {
            process.stdout.write(`${index} - ${projectTaskAssignment.task.name} (${projectTaskAssignment.project.name}) \n`);
        });

        rl.question('Please choose one of the follwing, by entering the number: ', function (numberEntered: string) {
            const index = Number(numberEntered);

            if(isNaN(index)) {
                throw new Error(`${index} is not a number.`);
            }

            if(!projectTaskAssignments[index]) {
                throw new Error(`${index} is not a valid option.`);
            }

            rl.close();
            resolve(projectTaskAssignments[index]) ;
        });
    })
}

function mapProjectTaskAssignmentToAlias(aliasKey: string, projectTaskAssignment: HarvestProjectTaskAssignment): Alias
{
    return {
        alias: aliasKey,
        idProject: projectTaskAssignment.project.id,
        idTask: projectTaskAssignment.task.id
    };
}

function storeAlias(alias: Alias, aliasFilePath: string): void {
    let aliases = readAliasFile(aliasFilePath);
    aliases.set(alias.alias, alias);
    writeAliasFile(aliases, aliasFilePath);
}

function readAliasFile(filePath: string): Map<string, Alias> {
   if (!aliasFileExists(filePath)) {
        writeAliasFile(new Map(), filePath);
   }
   filePath = transformPath(filePath);
   return new Map(JSON.parse(fs.readFileSync(filePath).toString()));
}

function writeAliasFile(aliases: Map<string, Alias>, filePath: string): void {
   filePath = transformPath(filePath);
   if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
   }
   fs.writeFileSync(filePath, JSON.stringify(Array.from(aliases.entries())), 'utf8');
}

function aliasFileExists(filePath: string): boolean {
   filePath = transformPath(filePath);
   return fs.existsSync(filePath);
}

function transformPath(path: string): string {
   return path.replace('~', homedir())
}