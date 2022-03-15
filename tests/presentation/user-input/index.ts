import { expect } from 'chai';
import { parseUserTimeInput } from '../../../src/presentation/user-input';

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
describe('User date input parsing test', () => {
  //TODO
});
