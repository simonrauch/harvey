declare module 'node-harvest-api'

interface HarvestUser {
    first_name: string;
}

interface HarvestProject {
    id: number;
    name: string;
}

interface HarvestTask {
    id: number;
    name: string;
}

interface HarvestProjectTaskAssignment {
    id: number;
    name: string;
    is_active: boolean;
    task: HarvestTask;
    project: HarvestProject;
}

interface HarvestTimeEntry {
    task_id: number;
    hours: number;
    project_id: number;
    spent_date: string;
    notes: string;
}