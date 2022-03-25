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
});
