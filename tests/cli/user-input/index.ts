import { expect } from 'chai';
import sinon, { SinonFakeTimers, SinonSandbox } from 'sinon';
import { defaultConfig, HarveyConfig } from '../../../src/business/config';
import { parseUserDateInput, parseUserTimeInput } from '../../../src/cli/user-input';

const fixedDate = new Date('2020-05-04');
let sandbox: SinonSandbox, clock: SinonFakeTimers;

beforeEach(() => {
  HarveyConfig.setConfig(defaultConfig);
  sandbox = sinon.createSandbox();
  clock = sinon.useFakeTimers(fixedDate.getTime());
});
afterEach(() => {
  sandbox.restore();
  clock.restore();
});

describe('user time input parsing', () => {
  it('should interpret integer input as minutes', () => {
    expect(parseUserTimeInput('15')).to.be.equal(0.25);
    expect(parseUserTimeInput('90')).to.be.equal(1.5);
  });
  it('should interpret inputs including "." as decimal hours', () => {
    expect(parseUserTimeInput('.25')).to.be.equal(0.25);
    expect(parseUserTimeInput('0.25')).to.be.equal(0.25);
    expect(parseUserTimeInput('0000.250000')).to.be.equal(0.25);
  });
  it('should interpret inputs including "," as decimal hours', () => {
    expect(parseUserTimeInput(',25')).to.be.equal(0.25);
    expect(parseUserTimeInput('0,25')).to.be.equal(0.25);
    expect(parseUserTimeInput('0000,250000')).to.be.equal(0.25);
  });
  it('should interpret inputs including one ":" as hours and minutes', () => {
    expect(parseUserTimeInput('0:15')).to.be.equal(0.25);
    expect(parseUserTimeInput('00:15')).to.be.equal(0.25);
    expect(parseUserTimeInput('00:6')).to.be.equal(0.1);
    expect(parseUserTimeInput('00:06')).to.be.equal(0.1);
    expect(parseUserTimeInput('01:06')).to.be.equal(1.1);
    expect(parseUserTimeInput('01:06')).to.be.equal(1.1);
    expect(parseUserTimeInput('1:06')).to.be.equal(1.1);
  });
  it('should throw error on inputs including two or more ":"', () => {
    expect(() => {
      parseUserTimeInput('10:32:32');
    }).to.throw('Invalid time input.');
    expect(() => {
      parseUserTimeInput('10::32:12');
    }).to.throw('Invalid time input.');
  });
  it('should throw error on inputs with ":" and more thand 2 digit numbers', () => {
    expect(() => {
      parseUserTimeInput('200:20');
    }).to.throw('Invalid time input.');
    expect(() => {
      parseUserTimeInput('20:201');
    }).to.throw('Invalid time input.');
  });
  it('should throw error on mixed input conventions', () => {
    expect(() => {
      parseUserTimeInput('1.000,25');
    }).to.throw('Invalid time input.');
    expect(() => {
      parseUserTimeInput('00:30,25');
    }).to.throw('Invalid time input.');
  });
  it('should throw error on inputs amounting to more than 24 hours', () => {
    expect(() => {
      parseUserTimeInput('24:30');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
    expect(() => {
      parseUserTimeInput('1500');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
    expect(() => {
      parseUserTimeInput('24,1');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
    expect(() => {
      parseUserTimeInput('24.01');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
  });
  it('should throw error on inputs below 0', () => {
    expect(() => {
      parseUserTimeInput('-0.1');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
    expect(() => {
      parseUserTimeInput('-1');
    }).to.throw('Invalid time input. Time input has be between 0 and 24 hours.');
  });
});

describe('user date input parsing', () => {
  it('should interpret empty string as current date', () => {
    expect(parseUserDateInput('')).to.be.equal('2020-05-04');
  });
  it('should interpret undefined input string as current date', () => {
    expect(parseUserDateInput()).to.be.equal('2020-05-04');
  });
  it('should interpret iso date string', () => {
    expect(parseUserDateInput('2020-12-18')).to.be.equal('2020-12-18');
  });
  it('should throw error on invalid dates', () => {
    expect(() => {
      parseUserDateInput('2020-13-18');
    }).to.throw('Invalid date input.');
    expect(() => {
      parseUserDateInput('asdf');
    }).to.throw('Invalid date input.');
    expect(() => {
      parseUserDateInput('15');
    }).to.throw('Invalid date input.');
    expect(() => {
      parseUserDateInput('1');
    }).to.throw('Invalid date input.');
    expect(() => {
      parseUserDateInput('-1');
    }).to.throw('Invalid date input.');
    expect(() => {
      parseUserDateInput('-20');
    }).to.throw('Invalid date input.');
  });
});
