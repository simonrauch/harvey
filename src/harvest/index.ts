import type { Config } from "../config";
import Harvest from 'node-harvest-api'

let projectTaskAssignmentCache: Array<HarvestProjectTaskAssignment>;
let harvestSdk: any;

export function getHarvestSdk(config: Config): any {
    if (!harvestSdk) {
        harvestSdk = new Harvest(config.accountId, config.accessToken, 'harvey');
    }

    return harvestSdk;
}

export async function bookTimeEntry(timeEntry: HarvestTimeEntry, config: Config): Promise<void> {
    return new Promise(resolve => {
        const harvest = getHarvestSdk(config);
        harvest.time_entries.create(timeEntry).then(() => {
            resolve()
        });
    })
}

export async function getAllProjectTaskAssignments(config: Config, forceFetch: boolean = false): Promise<Array<HarvestProjectTaskAssignment>> {
    return new Promise(resolve => {
        if (projectTaskAssignmentCache && !forceFetch) {
            resolve(projectTaskAssignmentCache);
        }

        const harvest = getHarvestSdk(config);
        let taskAssignmentPromises: Array<Promise<Array<HarvestProjectTaskAssignment>>> = [];

        harvest.projects.all().then((projects: Array<HarvestProject>) => {
            projects.forEach(project => {
                taskAssignmentPromises.push(harvest.projects.pipe(project.id).task_assignments.all())
            })

            Promise.all(taskAssignmentPromises).then(taskAssignmentLists => {
                let collectedTaskAssignments: Array<HarvestProjectTaskAssignment> = []
                for (let taskAssignments of taskAssignmentLists) {
                    collectedTaskAssignments = collectedTaskAssignments.concat(taskAssignments)
                }
                projectTaskAssignmentCache = collectedTaskAssignments;
                resolve(projectTaskAssignmentCache)
            })
        });
    });
}