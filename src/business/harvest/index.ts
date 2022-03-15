export interface HarvestUser {
  id: number;
  first_name: string;
}

export interface HarvestProject {
  id: number;
  name: string;
}

export interface HarvestTask {
  id: number;
  name: string;
}

export interface HarvestProjectTaskAssignment {
  task: HarvestTask;
  project: HarvestProject;
}

export interface HarvestProjectAssignment {
  id: number;
  project: HarvestProject;
  task_assignments: HarvestTaskAssignment[];
}

export interface HarvestTaskAssignment {
  id: number;
  task: HarvestTask;
}

export interface HarvestTimeEntry {
  id?: number;
  task_id?: number;
  hours: number;
  project_id?: number;
  spent_date: string;
  notes: string | null;
  is_running?: boolean;
  task?: HarvestTask;
  project?: HarvestProject;
}
