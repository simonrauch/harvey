import { HarveyTimerStatus, showTimer, updateTimer } from '../../src/business/timer';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../src/business/config';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import * as timerCliOutput from '../../src/cli/cli-output/timer';
import * as timerFileSystem from '../../src/service/filesystem/timer';
import * as harvestApi from '../../src/service/api/harvest';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(sinonChai);

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

describe('timer status', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(defaultConfig);
  });

  it('should print running timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.running,
      timeEntry: timeEntryRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    printTimerStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should print running timer, even if additional paused timer file is present', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.running,
      timeEntry: timeEntryRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    printTimerStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should print stopped timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves(null);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({ status: HarveyTimerStatus.stopped });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    printTimerStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should print paused timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves(null);
    const printTimerStub = sinon.stub(timerCliOutput, 'printTimer').returns();
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);

    await showTimer();

    expect(printTimerStub).to.have.been.calledOnceWith({
      status: HarveyTimerStatus.paused,
      timeEntry: timeEntryNotRunning,
    });
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    printTimerStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });
});

describe('timer update', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(defaultConfig);
  });

  it('should update running timers note', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, notes: 'note updated' };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, 'note updated', null, null, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should update running timers date', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, spent_date: '2022-03-10' };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer('2022-03-10', null, null, null, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should round running timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, hours: 0.25 };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, null, null, null, true, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should add time to running timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, hours: 0.37 };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, null, 0.25, null, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should subtract time from running timer', async () => {
    const getRunningTimeEntryStub = sinon
      .stub(harvestApi, 'getRunningTimeEntry')
      .resolves({ ...timeEntryRunning, hours: 0.25 });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, hours: 0.15 };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, null, null, 0.1, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should add and subtract time from a running timer', async () => {
    const getRunningTimeEntryStub = sinon
      .stub(harvestApi, 'getRunningTimeEntry')
      .resolves({ ...timeEntryRunning, hours: 0.3 });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const expectedUpdatedTimeEntry = { ...timeEntryRunning, hours: 0.55 };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, null, 0.5, 0.25, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should throw error when running timers time entry would be below 0 hours after subtracting time.', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, null, 30, false, 15)).to.be.rejectedWith(
      'Cannot set time entries new to time to a value below 0.',
    );

    expect(saveTimeEntryStub).not.to.be.called;
    expect(readPausedTimerStub).to.be.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should throw error when running timers time entry would be above 24 hours after adding time.', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves({ ...timeEntryRunning });
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(null);
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, 1500, null, false, 15)).to.be.rejectedWith(
      'Cannot set time entries new to time to a value above 24h.',
    );

    expect(saveTimeEntryStub).not.to.be.called;
    expect(readPausedTimerStub).to.be.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should throw error when running timers time is modified and rounded at the same time', async () => {
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, 15, null, true, 15)).to.be.rejectedWith(
      'Rounding and adding/subtracting are exclusive timer actions. Please only use one.',
    );

    expect(saveTimeEntryStub).not.to.be.called;

    saveTimeEntryStub.restore();
  });

  it('should update paused timers note', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves(null);
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);
    const storePausedTimerStub = sinon.stub(timerFileSystem, 'storePausedTimer').returns();
    const expectedUpdatedTimeEntry = { ...timeEntryNotRunning, notes: 'note updated' };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);

    await updateTimer(null, 'note updated', null, null, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(storePausedTimerStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    storePausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });

  it('should update paused timers date');
  it('should round paused timer');
  it('should add time to paused timer');
  it('should subtract time from paused timer');
  it('should add and subtract time from a paused timer', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves();
    const readPausedTimerStub = sinon
      .stub(timerFileSystem, 'readPausedTimer')
      .returns({ ...timeEntryNotRunning, hours: 0.3 });
    const expectedUpdatedTimeEntry = { ...timeEntryNotRunning, hours: 0.55 };
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry').resolves(expectedUpdatedTimeEntry);
    const storePausedTimerStub = sinon.stub(timerFileSystem, 'storePausedTimer');

    await updateTimer(null, null, 0.5, 0.25, false, 15);

    expect(saveTimeEntryStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(storePausedTimerStub).to.have.been.calledOnceWith(expectedUpdatedTimeEntry);
    expect(readPausedTimerStub).to.have.been.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
    storePausedTimerStub.restore();
  });
  it('should throw error when paused timers time entry would be below 0 hours after subtracting time.', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves(null);
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, null, 30, false, 15)).to.be.rejectedWith(
      'Cannot set time entries new to time to a value below 0.',
    );

    expect(saveTimeEntryStub).not.to.be.called;
    expect(readPausedTimerStub).to.be.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });
  it('should throw error when paused timers time entry would be above 24 hours after adding time.', async () => {
    const getRunningTimeEntryStub = sinon.stub(harvestApi, 'getRunningTimeEntry').resolves(null);
    const readPausedTimerStub = sinon.stub(timerFileSystem, 'readPausedTimer').returns(timeEntryNotRunning);
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, 1500, null, false, 15)).to.be.rejectedWith(
      'Cannot set time entries new to time to a value above 24h.',
    );

    expect(saveTimeEntryStub).not.to.be.called;
    expect(readPausedTimerStub).to.be.calledOnce;
    expect(getRunningTimeEntryStub).to.have.been.calledOnce;

    saveTimeEntryStub.restore();
    readPausedTimerStub.restore();
    getRunningTimeEntryStub.restore();
  });
  it('should throw error when paused timers time is modified and rounded at the same time', async () => {
    const saveTimeEntryStub = sinon.stub(harvestApi, 'saveTimeEntry');

    await expect(updateTimer(null, null, 15, null, true, 15)).to.be.rejectedWith(
      'Rounding and adding/subtracting are exclusive timer actions. Please only use one.',
    );

    expect(saveTimeEntryStub).not.to.be.called;

    saveTimeEntryStub.restore();
  });
});

describe('timer lifecycle', () => {
  it('should start new timer');
  it('should throw error if timer is started when there already is a running timer');
  it('should pause running timer');
  it('should throw error if timer is paused when there already is a paused timer');
  it('should resume paused timer');
  it('should throw error if timer is resumed when there already is a running timer');
  it('should stop running timer');
  it('should stop paused timer');
  it('should throw error if timer is stopped when there is no running timer');
});
