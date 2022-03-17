## docs

- date input format
- time input format

## missing tests

- service/api/harvest --> incomplete
- cli --> incomplete (check if process.stdout can even be stubbed/mocked --> check [this](https://github.com/yargs/yargs/blob/main/docs/advanced.md#testing-a-command-module) for yargs command testing)
- business/timer --> incomplete
- business/parser
- business/harvest
- business/day
- business/config
- business/alias

## day command

- check timezone

## cli

- scale tables according to terminal width

## timer

- restart from stopped entry
- update current timers note with git commit message of passed reference
  - use output of `git show --pretty=format:%s -s <ref>` example:
    - `git show --pretty=format:%s -s HEAD`
    - `git show --pretty=format:%s -s HEAD^`

## auth check on startup

- check auth after loading config
- store authenticated user id after check

## refactoring

- refactor error handling

## add oauth authentication

- keep option to auth with PAT
- [tutorial/guide](https://thecodebarbarian.com/oauth-in-nodejs-cli-apps.html)
- [harvest doc](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#for-client-side-applications)
