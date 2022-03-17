import * as fileSystemService from '../../../src/service/filesystem';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import { readConfigFile, writeConfigFile } from '../../../src/service/filesystem/config';

chai.use(sinonChai);

const config = { ...defaultConfig };

describe('config filesystem service', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(config);
  });
  it('should write config file', () => {
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');

    writeConfigFile(config, '/config.json');

    expect(writeToJsonFileMock).to.have.been.calledWith(config, '/config.json');

    writeToJsonFileMock.restore();
  });
  it('should read config file', () => {
    const readFromJsonFileMock = sinon.stub(fileSystemService, 'readFromJsonFile').returns(config);
    const fileExistsMock = sinon.stub(fileSystemService, 'fileExists').returns(true);

    const readConfig = readConfigFile('/config.json');

    expect(readConfig).to.eql(config);
    expect(readFromJsonFileMock).to.have.been.calledWith('/config.json');
    expect(fileExistsMock).to.have.been.called;

    readFromJsonFileMock.restore();
    fileExistsMock.restore();
  });

  it("should throw error if config file doesn't exist", () => {
    const readFromJsonFileMock = sinon.stub(fileSystemService, 'readFromJsonFile').returns(config);
    const fileExistsMock = sinon.stub(fileSystemService, 'fileExists').returns(false);

    expect(() => {
      readConfigFile('/config.json');
    }).to.throw(`No config file found at "/config.json". Please create one, by running the init command`);

    expect(fileExistsMock).to.have.been.calledWith('/config.json');
    expect(readFromJsonFileMock).to.not.have.been.called;

    readFromJsonFileMock.restore();
    fileExistsMock.restore();
  });
});
