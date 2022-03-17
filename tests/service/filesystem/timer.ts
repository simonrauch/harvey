import * as fileSystemService from '../../../src/service/filesystem';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import { deletePausedTimer, readPausedTimer, storePausedTimer } from '../../../src/service/filesystem/timer';

chai.use(sinonChai);

const config = { ...defaultConfig, pausedTimerFilePath: '~/.config/harvey/paused_timer.json' };

const timeEntry = {
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

describe('timer filesystem service', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(config);
  });
  it('should write paused timer file', () => {
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');

    storePausedTimer(timeEntry);

    expect(writeToJsonFileMock).to.have.been.calledWith(timeEntry, config.pausedTimerFilePath);

    writeToJsonFileMock.restore();
  });
  it('should read paused timer file', () => {
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');
    const readFromJsonFileMock = sinon.stub(fileSystemService, 'readFromJsonFile').returns(timeEntry);

    const pausedTimer = readPausedTimer();

    expect(pausedTimer).to.eql(timeEntry);
    expect(writeToJsonFileMock).to.not.have.been.called;
    expect(readFromJsonFileMock).to.have.been.calledWith(config.pausedTimerFilePath);

    writeToJsonFileMock.restore();
    readFromJsonFileMock.restore();
  });

  it('should read null if paused timer file does not exist', () => {
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');
    const readFromJsonFileMock = sinon.stub(fileSystemService, 'readFromJsonFile').returns(null);

    const pausedTimer = readPausedTimer();

    expect(pausedTimer).to.eql(null);
    expect(writeToJsonFileMock).to.not.have.been.called;
    expect(readFromJsonFileMock).to.have.been.calledWith(config.pausedTimerFilePath);

    writeToJsonFileMock.restore();
    readFromJsonFileMock.restore();
  });

  it('should delete paused timer file', () => {
    const deleteFileMock = sinon.stub(fileSystemService, 'deleteFile');

    deletePausedTimer();

    expect(deleteFileMock).to.have.been.calledWith(config.pausedTimerFilePath);

    deleteFileMock.restore();
  });
});
