import chai, { expect } from 'chai';
import yargs from 'yargs';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import * as timerBusiness from '../../../src/business/timer';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';

chai.use(sinonChai);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = yargs.command(require('../../../src/cli/command/timer'));

describe('timer command', () => {
  it('should show timer', async () => {
    const showTimerStub = sinon.stub(timerBusiness, 'showTimer');
    const loadConfigStub = sinon.stub(HarveyConfig, 'loadConfig').returns(defaultConfig);
    const exitStub = sinon.stub(process, 'exit');

    const parser = yargs.commandDir('../../../src/cli/command').demandCommand().strict().alias({
      h: 'help',
    });

    await new Promise((resolve) => {
      parser.parse('timer status', (err: unknown, argv: unknown, output: unknown) => resolve(output));
    });

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

    await new Promise((resolve) => {
      parser.parse('timer', (err: unknown, argv: unknown, output: unknown) => resolve(output));
    });

    expect(showTimerStub).to.have.been.called;
    expect(loadConfigStub).to.have.been.calledWith('~/.config/harvey/config.json');
    expect(exitStub).to.have.been.calledWith(0);

    showTimerStub.restore();
    exitStub.restore();
    loadConfigStub.restore();
  });
});
