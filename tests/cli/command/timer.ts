import chai, { expect } from 'chai';
import yargs from 'yargs';
import sinonChai from 'sinon-chai';
import sinon, { SinonFakeTimers, SinonSandbox } from 'sinon';
import * as timerBusiness from '../../../src/business/timer';
import * as cliOutput from '../../../src/cli/cli-output';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';

chai.use(sinonChai);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = yargs.command(require('../../../src/cli/command/timer'));

async function runTimerCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    parser.parse('timer ' + command, (err: unknown, argv: unknown, output: string) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(output);
    });
  });
}

describe('timer command', () => {
  const fixedDate = new Date('2020-05-04');
  let sandbox: SinonSandbox, clock: SinonFakeTimers;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sinon.useFakeTimers(fixedDate.getTime());
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  it('should show timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('status');

    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should default to show timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('');

    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should start timer today', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const startTimerStub = sinon.stub(timerBusiness, 'startTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('start TEST-123');

    expect(startTimerStub).to.have.been.calledWith('TEST-123', '2020-05-04', '');
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    startTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should start timer with date', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const startTimerStub = sinon.stub(timerBusiness, 'startTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('start TEST-123 -d 2020-05-06');

    expect(startTimerStub).to.have.been.calledWith('TEST-123', '2020-05-06', '');
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    startTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should start timer with note', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const startTimerStub = sinon.stub(timerBusiness, 'startTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('start TEST-123 -n "my note"');

    expect(startTimerStub).to.have.been.calledWith('TEST-123', '2020-05-04', 'my note');
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    startTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should start timer with date and note', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const startTimerStub = sinon.stub(timerBusiness, 'startTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('start TEST-123 -d 2020-05-06 -n "my note"');

    expect(startTimerStub).to.have.been.calledWith('TEST-123', '2020-05-06', 'my note');
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    startTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should print error if start timer is called without alias', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const startTimerStub = sinon.stub(timerBusiness, 'startTimer');
    const printMessageStub = sinon.stub(cliOutput, 'printMessage');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('start');

    expect(startTimerStub).to.not.have.been.calledWith('TEST-123', '2020-05-06', 'my note');
    expect(printMessageStub).to.have.been.calledWith('<alias> is required to start a timer.');
    expect(showTimerStub).to.not.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(1);

    showTimerStub.restore();
    startTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
    printMessageStub.restore();
  });

  it('should stop timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const stopRunningTimerStub = sinon.stub(timerBusiness, 'stopRunningTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('stop');

    expect(stopRunningTimerStub).to.have.been.calledWith(false, defaultConfig.defaultRoundingInterval);
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    stopRunningTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should stop timer and round up', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const stopRunningTimerStub = sinon.stub(timerBusiness, 'stopRunningTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('stop -r');

    expect(stopRunningTimerStub).to.have.been.calledWith(true, defaultConfig.defaultRoundingInterval);
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    stopRunningTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should stop timer and round up with specified rounding interval', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const stopRunningTimerStub = sinon.stub(timerBusiness, 'stopRunningTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('stop -r --ri 5');

    expect(stopRunningTimerStub).to.have.been.calledWith(true, 5);
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    stopRunningTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should pause running timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const pauseActiveTimerStub = sinon.stub(timerBusiness, 'pauseActiveTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('pause');

    expect(pauseActiveTimerStub).to.have.been.called;
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    pauseActiveTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should resume paused timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const resumePausedTimerStub = sinon.stub(timerBusiness, 'resumePausedTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    await runTimerCommand('resume');

    expect(resumePausedTimerStub).to.have.been.called;
    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    resumePausedTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });

  it('should update current timer');
});
