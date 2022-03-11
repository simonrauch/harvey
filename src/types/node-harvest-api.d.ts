declare module 'node-harvest-api';

interface Harvest {
  time_entries: function;
  users: function;
}

interface HarvestUser {
  id: number;
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
  task: HarvestTask;
  project: HarvestProject;
}

interface HarvestProjectAssignment {
  id: number;
  project: HarvestProject;
  task_assignments: HarvestTaskAssignment[];
}

interface HarvestTaskAssignment {
  id: number;
  task: HarvestTask;
}

interface HarvestTimeEntry {
  id?: number;
  task_id?: number;
  hours: number;
  project_id?: number;
  spent_date: string;
  notes: string;
  is_running?: boolean;
  task?: HarvestTask;
  project?: HarvestProject;
}
