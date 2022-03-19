import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import nock from 'nock';
import chai from 'chai';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';
import {
  getAuthenticatedUserId,
  getMyProjectAssignments,
  getMyProjectTaskAssignments,
  getMyTimeEntriesPerDate,
  isAccountIdAndTokenValid,
  resetHarvestCache,
  restartTimeEntry,
  saveTimeEntry,
  stopTimeEntry,
} from '../../../src/service/api/harvest';
import { expect } from 'chai';

chai.use(chaiNock);
chai.use(chaiAsPromised);

const allProjectAssignments = [
  {
    id: 321807936,
    is_project_manager: false,
    is_active: true,
    use_default_rates: true,
    budget: null,
    created_at: '2021-12-21T15:34:22Z',
    updated_at: '2021-12-21T15:34:22Z',
    hourly_rate: null,
    project: { id: 31205057, name: 'Wawiwahu Internal', code: '', is_billable: true },
    client: { id: 1667002, name: 'Wawiwahu', currency: 'EUR' },
    task_assignments: [
      {
        id: 336914669,
        billable: false,
        is_active: true,
        created_at: '2022-01-12T10:53:50Z',
        updated_at: '2022-01-14T14:21:15Z',
        hourly_rate: null,
        budget: 16,
        task: { id: 18065527, name: 'Wawiwahu Sprintchange' },
      },
    ],
  },
  {
    id: 285869057,
    is_project_manager: false,
    is_active: true,
    use_default_rates: true,
    budget: null,
    created_at: '2021-05-03T07:56:08Z',
    updated_at: '2021-05-03T07:56:08Z',
    hourly_rate: null,
    project: { id: 28636993, name: 'Wawiwahu', code: 'PID-670', is_billable: true },
    client: { id: 1667002, name: 'Wawiwahu', currency: 'EUR' },
    task_assignments: [
      {
        id: 307225569,
        billable: false,
        is_active: true,
        created_at: '2021-05-03T07:56:08Z',
        updated_at: '2021-05-03T07:56:08Z',
        hourly_rate: null,
        budget: null,
        task: { id: 10671431, name: 'Administration' },
      },
      {
        id: 307225570,
        billable: true,
        is_active: true,
        created_at: '2021-05-03T07:56:08Z',
        updated_at: '2021-05-03T07:56:08Z',
        hourly_rate: null,
        budget: null,
        task: { id: 12708448, name: 'Controlling' },
      },
      {
        id: 308073832,
        billable: true,
        is_active: true,
        created_at: '2021-05-10T09:41:14Z',
        updated_at: '2021-05-10T09:41:14Z',
        hourly_rate: null,
        budget: null,
        task: { id: 16160811, name: 'WAWI-666 Important stuff' },
      },
    ],
  },
];

const myProjectAssignmentsResponse = {
  project_assignments: allProjectAssignments,
  per_page: 100,
  total_pages: 1,
  total_entries: 15,
  next_page: null,
  previous_page: null,
  page: 1,
  links: {
    first: 'https://api.harvestapp.com/v2/users/me/project_assignments?page=1&per_page=100&ref=first',
    next: null,
    previous: null,
    last: 'https://api.harvestapp.com/v2/users/me/project_assignments?page=1&per_page=100&ref=last',
  },
};

const user = {
  id: 666,
  first_name: 'Simon',
  last_name: 'Rauch',
  email: 'sr@simonrauch.com',
  telephone: '',
  timezone: 'Amsterdam',
  weekly_capacity: 144000,
  has_access_to_all_future_projects: false,
  is_contractor: false,
  is_admin: false,
  is_project_manager: true,
  can_see_rates: false,
  can_create_projects: false,
  can_create_invoices: false,
  is_active: true,
  calendar_integration_enabled: false,
  calendar_integration_source: null,
  created_at: '2019-01-14T02:03:37Z',
  updated_at: '2022-02-24T16:17:37Z',
  roles: [],
  permissions_claims: [
    'expenses:read:managed',
    'expenses:write:own',
    'projects:read:managed',
    'timers:read:managed',
    'timers:write:own',
  ],
};

const timeEntryNotRunning = {
  id: 666,
  spent_date: '2022-03-15',
  hours: 0.12,
  notes: 'note',
  timer_started_at: '2022-03-15T12:04:45Z',
  is_running: false,
  created_at: '2022-03-15T12:04:45Z',
  updated_at: '2022-03-15T12:04:45Z',
  user: { id: 666, name: 'Simon Rauch' },
  client: { id: 666, name: 'Wawiwahu', currency: 'EUR' },
  project: { id: 666, name: 'Wawiwahu Project', code: 'PID-666' },
  task: { id: 666, name: 'Example Task' },
};

const timeEntryRunning = { ...timeEntryNotRunning, is_running: true };

describe('harvest api service', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(defaultConfig);
    resetHarvestCache();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should request current users project assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;
  });

  it('should cache project assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments();

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.equal(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.false;
  });

  it('should reset project assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    resetHarvestCache();

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments();

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.eql(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should ignore project assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments(true);

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.eql(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should request current users project task assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;
  });

  it('should cache project task assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.equal(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.false;
  });

  it('should reset project task assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    resetHarvestCache();

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.eql(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should ignore project task assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments(true);

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.eql(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should request current user id', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId = await getAuthenticatedUserId();

    expect(userId).to.eql(666);
    expect(getUsersMeNock.isDone()).to.be.true;
  });

  it('should cache current user id', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId = await getAuthenticatedUserId();

    expect(getUsersMeNock.isDone()).to.be.true;
    expect(userId).to.eql(666);

    const getUsersMeNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId2 = await getAuthenticatedUserId();

    expect(userId2).to.eql(userId);
    expect(getUsersMeNock2.isDone()).to.be.false;
  });

  it('should reset current user id cache', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId = await getAuthenticatedUserId();

    expect(getUsersMeNock.isDone()).to.be.true;
    expect(userId).to.eql(666);

    const getUsersMeNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    resetHarvestCache();
    const userId2 = await getAuthenticatedUserId();

    expect(userId2).to.eql(userId);
    expect(getUsersMeNock2.isDone()).to.be.true;
  });

  it('should ignore current user id cache', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId = await getAuthenticatedUserId();

    expect(getUsersMeNock.isDone()).to.be.true;
    expect(userId).to.eql(666);

    const getUsersMeNock2 = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const userId2 = await getAuthenticatedUserId(true);

    expect(userId2).to.eql(userId);
    expect(getUsersMeNock2.isDone()).to.be.true;
  });

  it('should post newly created time entry', async () => {
    const postTimeEntryNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .post('/api/v2/time_entries', { ...timeEntryNotRunning, id: undefined })
      .reply(200, { ...timeEntryNotRunning }, []);

    const timeEntry = await saveTimeEntry({ ...timeEntryNotRunning, id: undefined });

    expect(timeEntry).to.eql(timeEntryNotRunning);
    expect(postTimeEntryNock.isDone()).to.be.true;
  });

  it('should post update to existing time entry', async () => {
    const patchTimeEntryNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .patch('/api/v2/time_entries/' + timeEntryNotRunning.id, { ...timeEntryNotRunning })
      .reply(200, { ...timeEntryNotRunning }, []);

    const timeEntry = await saveTimeEntry({ ...timeEntryNotRunning });

    expect(timeEntry).to.eql(timeEntryNotRunning);
    expect(patchTimeEntryNock.isDone()).to.be.true;
  });

  it('should throw error if id of non existing time entry is given for update request', async () => {
    const patchTimeEntryNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .patch('/api/v2/time_entries/' + timeEntryNotRunning.id, { ...timeEntryNotRunning })
      .reply(404, { status: 404, error: 'Not Found' }, []);

    await expect(saveTimeEntry({ ...timeEntryNotRunning })).to.be.rejectedWith('Request failed with status code 404');
    expect(patchTimeEntryNock.isDone()).to.be.true;
  });

  it('should post update to restart existing time entry', async () => {
    const patchTimeEntryNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .patch('/api/v2/time_entries/' + timeEntryNotRunning.id + '/restart', {})
      .reply(200, { ...timeEntryRunning }, []);

    const timeEntry = await restartTimeEntry({ ...timeEntryNotRunning });

    expect(timeEntry).to.eql(timeEntryRunning);
    expect(patchTimeEntryNock.isDone()).to.be.true;
  });

  it('should post update to stop running time entry', async () => {
    const patchTimeEntryNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .patch('/api/v2/time_entries/' + timeEntryRunning.id + '/stop', {})
      .reply(200, { ...timeEntryNotRunning }, []);

    const timeEntry = await stopTimeEntry({ ...timeEntryRunning });

    expect(timeEntry).to.eql(timeEntryNotRunning);
    expect(patchTimeEntryNock.isDone()).to.be.true;
  });

  it('should request current users time entries per per day', async () => {
    const expectedTimeEntries = [{ ...timeEntryNotRunning }, { ...timeEntryRunning }];
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);
    const getTimeEntriesNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/time_entries')
      .query({ from: '2020-12-20', to: '2020-12-20', user_id: '666' })
      .reply(
        200,
        {
          time_entries: expectedTimeEntries,
          per_page: 100,
          total_pages: 1,
          total_entries: 2,
          next_page: null,
          previous_page: null,
          page: 1,
          links: {
            first:
              'https://api.harvestapp.com/v2/time_entries?from=2020-12-20&page=1&per_page=100&ref=first&to=2020-12-20&user_id=666',
            next: null,
            previous: null,
            last: 'https://api.harvestapp.com/v2/time_entries?from=2020-12-20&page=1&per_page=100&ref=last&to=2020-12-20&user_id=666',
          },
        },
        [],
      );

    const timeEntries = await getMyTimeEntriesPerDate('2020-12-20');

    expect(timeEntries).to.eql(expectedTimeEntries);
    expect(getUsersMeNock.isDone()).to.be.true;
    expect(getTimeEntriesNock.isDone()).to.be.true;
  });

  it('should verify current user is authenticated', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(200, user, []);

    const credsAreValid = await isAccountIdAndTokenValid('wrong', 'creds');

    expect(credsAreValid).to.be.true;
    expect(getUsersMeNock.isDone()).to.be.true;
  });

  it('should verify current user is not authenticated', async () => {
    const getUsersMeNock = nock('https://api.harvestapp.com', { encodedQueryParams: true })
      .get('/api/v2/users/me')
      .reply(
        401,
        {
          error: 'invalid_token',
          error_description: 'The access token provided is expired, revoked, malformed or invalid for other reasons.',
        },
        [],
      );

    const credsAreValid = await isAccountIdAndTokenValid('wrong', 'creds');

    expect(credsAreValid).to.be.false;
    expect(getUsersMeNock.isDone()).to.be.true;
  });
});
