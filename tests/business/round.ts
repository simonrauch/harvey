import { expect } from 'chai';
import { HarvestTimeEntry } from '../../src/business/harvest';
import { roundTimeEntry } from '../../src/business/round';

describe('time entry rounding', () => {
  it('should round up time entry', () => {
    const timeEntry: HarvestTimeEntry = {
      hours: 0.1,
      spent_date: '2022-06-06',
      notes: null,
    };
    const resultTimeEntry = roundTimeEntry(timeEntry, 15);
    expect(resultTimeEntry.hours).to.be.equal(0.25);
  });
  it('should not round up time entry', () => {
    const timeEntry: HarvestTimeEntry = {
      hours: 0.5,
      spent_date: '2022-06-06',
      notes: null,
    };
    const resultTimeEntry = roundTimeEntry(timeEntry, 15);
    expect(resultTimeEntry.hours).to.be.equal(0.5);
  });
  it('should not round up time entry with 0.0001 precision', () => {
    const timeEntry: HarvestTimeEntry = {
      hours: 0.2501,
      spent_date: '2022-06-06',
      notes: null,
    };
    const resultTimeEntry = roundTimeEntry(timeEntry, 15);
    expect(resultTimeEntry.hours).to.be.equal(0.5);
  });
  it('should modify original time entry object', () => {
    const timeEntry: HarvestTimeEntry = {
      hours: 0.1,
      spent_date: '2022-06-06',
      notes: null,
    };
    const resultTimeEntry = roundTimeEntry(timeEntry, 15);
    expect(resultTimeEntry).to.be.eql(timeEntry);
  });
});
