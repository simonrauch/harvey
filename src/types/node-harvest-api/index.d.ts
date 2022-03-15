declare module 'node-harvest-api' {
  export default class Harvest {
    constructor(accountId: string, accessToken: string, applicationName: string);
    time_entries: function;
    users: function;
  }
}
