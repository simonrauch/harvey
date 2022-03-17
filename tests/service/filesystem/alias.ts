import * as fileSystemService from '../../../src/service/filesystem';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import { Alias } from '../../../src/business/alias';
import { readAliasFile, writeAliasFile } from '../../../src/service/filesystem/alias';

chai.use(sinonChai);

const config = { ...defaultConfig, aliasFilePath: '~/.config/harvey/aliases.json' };

describe('alias filesystem service', () => {
  beforeEach(() => {
    HarveyConfig.setConfig(config);
  });
  it('should write aliases', () => {
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');

    const aliases: Map<string, Alias> = new Map();
    aliases.set('ALIAS_KEY', { alias: 'ALIAS_KEY', idProject: 666, idTask: 666 });
    aliases.set('ALIAS_KEY_2', { alias: 'ALIAS_KEY_2', idProject: 666, idTask: 667 });

    writeAliasFile(aliases);

    expect(writeToJsonFileMock).to.have.been.calledWith(Array.from(aliases.entries()), config.aliasFilePath);

    writeToJsonFileMock.restore();
  });
  it('should read aliases', () => {
    const aliases: Map<string, Alias> = new Map();
    aliases.set('ALIAS_KEY', { alias: 'ALIAS_KEY', idProject: 666, idTask: 666 });
    aliases.set('ALIAS_KEY_2', { alias: 'ALIAS_KEY_2', idProject: 666, idTask: 667 });

    const fileExistsMock = sinon.stub(fileSystemService, 'fileExists').returns(true);
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');
    const readFromJsonFileMock = sinon
      .stub(fileSystemService, 'readFromJsonFile')
      .returns(Array.from(aliases.entries()));

    const readAliases = readAliasFile();

    expect(readAliases).to.eql(aliases);
    expect(fileExistsMock).to.have.been.calledWith(config.aliasFilePath);
    expect(writeToJsonFileMock).to.not.have.been.called;
    expect(readFromJsonFileMock).to.have.been.calledWith(config.aliasFilePath);

    fileExistsMock.restore();
    writeToJsonFileMock.restore();
    readFromJsonFileMock.restore();
  });

  it('should create empty alias file and read it', () => {
    const fileExistsMock = sinon.stub(fileSystemService, 'fileExists').returns(false);
    const writeToJsonFileMock = sinon.stub(fileSystemService, 'writeToJsonFile');
    const readFromJsonFileMock = sinon
      .stub(fileSystemService, 'readFromJsonFile')
      .returns(Array.from(new Map().entries()));

    const readAliases = readAliasFile();

    expect(readAliases).to.eql(new Map());
    expect(fileExistsMock).to.have.been.calledWith(config.aliasFilePath);
    expect(writeToJsonFileMock).to.have.been.calledWith(Array.from(new Map().entries()), config.aliasFilePath);
    expect(readFromJsonFileMock).to.have.been.calledWith(config.aliasFilePath);

    fileExistsMock.restore();
    writeToJsonFileMock.restore();
    readFromJsonFileMock.restore();
  });
});
