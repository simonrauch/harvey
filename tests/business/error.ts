import { handleError, HarveyError } from '../../src/business/error';
import * as cliOutput from '../../src/cli/cli-output';
import { expect } from 'chai';
import sinon from 'sinon';

class HarveyErrorExtension extends HarveyError {}

describe('error handler', () => {
  it('should print known "HarveyError"', () => {
    const printMessageStub = sinon.stub(cliOutput, 'printMessage');
    handleError(new HarveyError('test error'));
    expect(printMessageStub).to.have.been.calledWith('test error');
    printMessageStub.restore();
  });
  it('should print extension of known "HarveyError"', () => {
    const printMessageStub = sinon.stub(cliOutput, 'printMessage');
    handleError(new HarveyErrorExtension('test error'));
    expect(printMessageStub).to.have.been.calledWith('test error');
    printMessageStub.restore();
  });
  it('should throw unknown errors', () => {
    const printMessageStub = sinon.stub(cliOutput, 'printMessage');
    expect(() => handleError(new Error('test error'))).to.throw('test error');
    expect(printMessageStub).to.not.have.been.called;
    printMessageStub.restore();
  });
});
