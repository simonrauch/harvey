import nock from 'nock';
import { showTimer } from '../src/business/timer';

describe('Examble test', () => {
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
          first: 'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=first&user_id=666',
          next: null,
          previous: null,
          last: 'https://api.harvestapp.com/v2/time_entries?is_running=true&page=1&per_page=100&ref=last&user_id=666',
        },
      },
      [],
    );
  it('checks if tests are running', () => {
    showTimer();
  });
});
