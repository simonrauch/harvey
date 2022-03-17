import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import nock from 'nock';
import chai from 'chai';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';
import {
  getMyProjectAssignments,
  getMyProjectTaskAssignments,
  resetHarvestCache,
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

describe('harvest api service', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(defaultConfig);
    resetHarvestCache();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should request current users project assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;
  });

  it('should cache project assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments();

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.equal(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.false;
  });

  it('should reset project assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    resetHarvestCache();

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments();

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.eql(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should ignore project assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments = await getMyProjectAssignments();

    expect(projectAssignments.length).to.be.equal(2);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectAssignments2 = await getMyProjectAssignments(true);

    expect(projectAssignments2.length).to.be.equal(2);
    expect(projectAssignments2).to.be.eql(projectAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should request current users project task assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;
  });

  it('should cache project task assignments', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.equal(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.false;
  });

  it('should reset project task assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    resetHarvestCache();

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.eql(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });

  it('should ignore project task assignments cache', async () => {
    const getMyProjectAssignmentsNock = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments = await getMyProjectTaskAssignments();

    expect(projectTaskAssignments.length).to.be.equal(4);
    expect(getMyProjectAssignmentsNock.isDone()).to.be.true;

    const getMyProjectAssignmentsNock2 = nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/users/me/project_assignments')
      .query({ page: '1' })
      .reply(200, myProjectAssignmentsResponse, []);

    const projectTaskAssignments2 = await getMyProjectTaskAssignments(true);

    expect(projectTaskAssignments2.length).to.be.equal(4);
    expect(projectTaskAssignments2).to.be.eql(projectTaskAssignments);
    expect(getMyProjectAssignmentsNock2.isDone()).to.be.true;
  });
  it('should request current user id');
  it('should cache current user id');
  it('should reset current user id cache');
  it('should ignore current user id cache');
  it('should post newly created time entry');
  it('should post update to existing time entry');
  it('should throw error if id of non existing time entry is given for update request');
  it('should post update to restart existing time entry');
  it('should post updatee to stop running time entry');
  it('should request current users time entries per per day');
  it('should verify current user is authenticated');
  it('should verify current user is not authenticated');
});
