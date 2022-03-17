import { expect } from 'chai';
import { defaultConfig, HarveyConfig } from '../../src/business/config';
import * as configFilesytemService from '../../src/service/filesystem/config';
import sinon from 'sinon';

const config = { ...defaultConfig };
describe('global config', () => {
  beforeEach(() => {
    HarveyConfig.resetConfig();
  });
  it('should load config from config file', () => {
    const readConfigFileStub = sinon.stub(configFilesytemService, 'readConfigFile').returns(config);
    const readConfig = HarveyConfig.loadConfig('/config.json');

    expect(readConfig).to.eql(config);
    expect(readConfigFileStub).to.have.been.calledWith('/config.json');

    readConfigFileStub.restore();
  });
  it('should throw error when getConfig() is called before beeing initialised.', () => {
    expect(() => {
      HarveyConfig.getConfig();
    }).to.throw('Global config was never initialised.');
  });
});

describe('config initialisation', () => {
  it('should ask for creds and initialise config');
  it('should ask again after given bad credentials and retry');
});
