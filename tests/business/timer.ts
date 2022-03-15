import nock from 'nock';
import { HarveyTimerStatus, showTimer } from '../../src/business/timer';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../src/business/config';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import * as timerCliOutput from '../../src/presentation/cli-output/timer';
import { resetHarvestCache } from '../../src/service/api/harvest';
import * as timerFileSystem from '../../src/service/filesystem/timer';
import { HarvestTimeEntry } from '../../src/business/harvest';

chai.use(sinonChai);

beforeEach(() => {
  resetHarvestCache();
  HarveyConfig.setConfig(defaultConfig);
  nock('https://api.harvestapp.com:443', { encodedQueryParams: true }).get('/api/v2/users/me').query({}).reply(
    200,
    {
      id: 666,
      first_name: 'Simon',
    },
    [],
  );
});

afterEach(() => {
  nock.cleanAll();
});

const timeEntryNotRunning = {
  id: 666,
  spent_date: '2022-03-15',
  hours: 0.12,
  notes: null,
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
function interceptGetTimeEntryRequestAndRespondWith(timeEntries: HarvestTimeEntry[]): void {
  nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
    .get('/api/v2/time_entries')
    .query({ is_running: 'true', user_id: '666', page: '1' })
    .reply(
      200,
      {
        time_entries: timeEntries,
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: 'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=first&user_id=666',
          next: null,
          previous: null,
          last: 'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=last&user_id=666',
        },
      },
      [],
    );
}

describe('timer status', () => {
  it('should print running timer', async () => {
    interceptGetTimeEntryRequestAndRespondWith([timeEntryRunning]);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.running,
      timeEntry: timeEntryRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    printTimerStub.restore();
    readPausedTimerStub.restore();
  });

  it('should print running timer again, when additional paused timer file is present', async () => {
    interceptGetTimeEntryRequestAndRespondWith([timeEntryRunning]);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.running,
      timeEntry: timeEntryRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    printTimerStub.restore();
    readPausedTimerStub.restore();
  });

  it('should print stopped timer', async () => {
    interceptGetTimeEntryRequestAndRespondWith([]);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({ status: HarveyTimerStatus.stopped });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    printTimerStub.restore();
    readPausedTimerStub.restore();
  });

  it('should print paused timer', async () => {
    interceptGetTimeEntryRequestAndRespondWith([]);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.paused,
      timeEntry: timeEntryNotRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    printTimerStub.restore();
    readPausedTimerStub.restore();
  });
});
