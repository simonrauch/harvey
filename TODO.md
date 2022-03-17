## docs

- date input format
- time input format

## missing tests

- service/filesystem --> incomplete
- service/api/harvest --> incomplete
- cli --> incomplete (check if process.stdout can even be stubbed/mocked)
- business/timer --> incomplete
- business/round
- business/parser
- business/harvest
- business/error
- business/day
- business/config
- business/alias

## day command

- check timezone

## timer

- restart from stopped entry

## auth check on startup

- check auth after loading config
- store authenticated user id after check

## refactoring

- refactor error handling

## add oauth authentication

- keep option to auth with PAT
- [tutorial/guide](https://thecodebarbarian.com/oauth-in-nodejs-cli-apps.html)
- [harvest doc](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#for-client-side-applications)
