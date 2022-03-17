import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import os from 'os';
import fs from 'fs';
import { fileExists, readFromJsonFile, transformPath } from '../../../src/service/filesystem';

chai.use(sinonChai);

describe('filesystem service', () => {
  it('should replace "~" with home directory', () => {
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');

    expect(transformPath('~/file.json')).to.be.equal('/home/wawiwahu/file.json');
    expect(homedirStub).to.have.been.called;

    homedirStub.restore();
  });

  it('should find existing file', () => {
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');
    const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);

    expect(fileExists('~/file.json')).to.be.true;
    expect(homedirStub).to.have.been.called;
    expect(existsSyncStub).to.have.been.calledWith('/home/wawiwahu/file.json');

    homedirStub.restore();
    existsSyncStub.restore();
  });

  it('should not find non existing file', () => {
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');
    const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);

    expect(fileExists('~/file.json')).to.be.false;
    expect(homedirStub).to.have.been.called;
    expect(existsSyncStub).to.have.been.calledWith('/home/wawiwahu/file.json');

    homedirStub.restore();
    existsSyncStub.restore();
  });

  it('should read and parse json from file', () => {
    const json = {
      yo: 'ho',
      ho: { no: 'lo' },
    };
    const jsonString = JSON.stringify(json);
    const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
    const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(jsonString);
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');

    expect(readFromJsonFile('/file.json')).to.be.eql(json);
    expect(readFileSyncStub).to.have.been.calledWith('/file.json');
    expect(homedirStub).to.have.been.called;

    existsSyncStub.restore();
    homedirStub.restore();
    readFileSyncStub.restore();
  });

  it("should read null if file doesn't exist", () => {
    const existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');

    expect(readFromJsonFile('/file.json')).to.be.eql(null);
    expect(homedirStub).to.have.been.called;

    existsSyncStub.restore();
    homedirStub.restore();
  });

  it('should throw error if json to be read is malformed');

  it('should write json to file', () => {
    const json = {
      yo: 'ho',
      ho: { no: 'lo' },
    };
    const jsonString = JSON.stringify(json);
    const existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
    const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(jsonString);
    const homedirStub = sinon.stub(os, 'homedir').returns('/home/wawiwahu');

    expect(readFromJsonFile('/file.json')).to.be.eql(json);
    expect(readFileSyncStub).to.have.been.calledWith('/file.json');
    expect(homedirStub).to.have.been.called;

    existsSyncStub.restore();
    homedirStub.restore();
    readFileSyncStub.restore();
  });

  it('should write json to file');
  it('should write json to file and create directory');
  it('should write pretty json to file');
  it('should delete file');
  it("should not delete file if it doesn't exist");
});
