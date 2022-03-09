[![npm](https://badgen.net/npm/v/@simonrauch/harvey/latest)](https://www.npmjs.com/package/@simonrauch/harvey) 
[![npm](https://badgen.net/npm/dt/@simonrauch/harvey)](https://www.npmjs.com/package/@simonrauch/harvey)

# Harvey

A simple CLI for Harvest.

## Installation

You can install harvey via NPM by running:

```
npm i -g @simonrauch/harvey
```

Or if you're using Homebrew on MacOS by running:

```
brew tap simonrauch/tap
brew install harvey
```

After harvey is installed, you have to initialize your configuration, by running:

```
harvey init
```

You'll be asked for your Harvest account ID and personal access token, so you'll have to create one in the [Developers section on Harvest](https://id.getharvest.com/developers). Oauth

This will create a configuration file (default: `~/.config/harvey/config.json`).

## Usage

### Help

If you're having trouble using Harvey, please refer to the `--help` flag. For example:

```
harvey --help
```

or

```
harvey timer --help
```

### Aliases

To modify time entries on Harvest, we need to specify which project and task they are reffering to. To make this easier Harvey creates aliases and saves them to a file (default: `~/.config/harvey/aliases.json`). The alias is typically a unique substring of the tasks name, like a Jira issue reference. For the most part Harvey will manage those aliases automatically, but you can modify them, by using the following commands:

  - `harvey add <alias>` will create an alias, by searching all available tasks on Harvest for `<alias>`.
  - `harvey remove <alias>` will remove the alias.
  - `harvey remove-all` will remove all aliases from your aliases file.

### Booking

You can add a time entry by running:

```
harvey book <alias> <minutes>
```

You can add notes by using the `-n` option and specify the date for the entry by using the `-d` option. The date option will default to the current date.

Example:

```
harvey book TEST-1234 45 -n "my comment" -d "2022-03-09"
```

### Timer

To track the time of the task you're working on you can use the `harvey timer` commands:

  - `harvey timer status` will show you the status of the current timer.
  - `harvey timer start <alias>` will start a timer.
    Similar to the `harvey book` command you can also specify the `-d` and `-n` options, to define the time entries notes and date.
  - `harvey timer pause` will pause the currently running timer.
  - `harvey timer resume` will resume the currently paused timer.
  - `harvey timer stop` will stop the current timer.
  - `harvey timer update` let's you update the `-d` and `-n` options of the current timer.

### Parser

Harvey can parse files with multiple time entries. Which file parser is used and it's configuration can be specified in your config file. To parse a file, run:

```
harvey parse <file>
```

Similar to the `harvey book` command you can also specify the `-d` and `-n` options, to define the time entries notes and date.

For example:

```
harvey parse Report_Team_Alpaca_03.03.2022.xlsx -d "2022-03-03" -n "sprintchange"
```

#### XLSX file parser

The XLSX file parser will select a worksheet in your XLSX file. Search for the heading cells for your alias and minutes, and will traverse down from your alias cell until it reaches the first empty cell.

The configuration (stored by default at `~/.config/harvey/config.json`) could for example look like this:

```
{
  ...
  "fileParser": {
    "type": "xlsx",
    "worksheet": "Timebooking",
    "aliasColumn": "Issue",
    "minutesColumn": "Minutes"
  }
}
```

This would mean, that the parser will look for a worksheet called "Timebooking" and parse it like this:

| Issue    | Task | Minutes |
|----------|------|---------|
| TEST-101 | ...  | 15      |
| TEST-103 | ...  | 30      |
| TEST-102 | ...  | 45      |
|          |      | 90      |
|          |      |         |
| TEST-201 | ...  | 30      |

The entries for TEST-101, TEST-102 and TEST-103 will be created. The summed up 90 minutes won't be booked. The entry for TEST-201 also won't be booked because the parser will stop at the first empty line.