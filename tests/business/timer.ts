import nock from 'nock';
import { HarveyTimerStatus, showTimer } from '../../src/business/timer';
import sinon from 'sinon';
import { defaultConfig, HarveyConfig } from '../../src/business/config';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import * as timerCliOutput from '../../src/presentation/cli-output/timer';

chai.use(sinonChai);

before(function () {
  HarveyConfig.setConfig(defaultConfig);
});
describe('stopped timer test', () => {
  it('should print stopped timer', async () => {
    nock('https://api.harvestapp.com:443', { encodedQueryParams: true }).get('/api/v2/users/me').query({}).reply(
      200,
      {
        id: 666,
        first_name: 'Simon',
      },
      [],
    );

    nock('https://api.harvestapp.com:443', { encodedQueryParams: true })
      .get('/api/v2/time_entries')
      .query({ is_running: 'true', user_id: '666', page: '1' })
      .reply(
        200,
        {
          time_entries: [],
          per_page: 100,
          total_pages: 1,
          total_entries: 0,
          next_page: null,
          previous_page: null,
          page: 1,
          links: {
            first:
              'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=first&user_id=666',
            next: null,
            previous: null,
            last: 'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=last&user_id=666',
          },
        },
        [],
      );

    const timerCliOutputMock = sinon.mock(timerCliOutput);
    timerCliOutputMock.expects('printTimer').calledOnceWith({ status: HarveyTimerStatus.stopped });

    await showTimer();

    timerCliOutputMock.verify();
    timerCliOutputMock.restore();
  });
});
