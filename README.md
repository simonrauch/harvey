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

You'll be asked for your Harvest account ID and personal access token, so you'll have to create one in the [Developers section on Harvest](https://id.getharvest.com/developers). 

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

  - `harvey alias add <alias>` will create an alias, by searching all available tasks on Harvest for `<alias>`. If you don't want to use the alias itself as the search term you can pass a different search term by passing the `-s` option. Example: `harvey alias add  TA -s "Technical Analysis"`
  - `harvey alias remove <alias>` will remove the alias.
  - `harvey alias remove-all` will remove all aliases from your aliases file.

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

### Days time entries

You can list a days time entries by running:

```
harvey day
```

or

```
harvey day status
```

You can specify the date for the entry by using the `-d` option. The date option will default to the current date.

Example:

```
harvey day -d "2022-03-09"
```

#### Modifying a days entries

To modify an entry you can run the following command and follow the prompts:

```
harvey day modify
```

One option is to round up an entry in a defined interval. The default interval is set in minutes in your config file (default: `~/.config/harvey/config.json`), but you can override this setting by passing the `--ri` option to the command.

Example:

```
harvey day modify --ri 30
```

If you want to round up all entries of a day, you can run:

```
harvey day round
```

This command also accepts the `--ri` option.

### Timer

To track the time of the task you're working on you can use the `harvey timer` commands:

  - `harvey timer` or `harvey timer status` will show you the status of the current timer.
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

# Setup for development

- Make sure there is NO `harvey` command linked right now. Verify by running `harvey --version`. If there is harvey installed on your system right now, unlink the executable or simply uninstall.
- Install using `npm i`
- Link the the package `npm link .`
- Start the tsc watcher `npm run dev`
- Let the watcher run and open a second terminal. Running `harvey` in the second terminal will now run from the built executable in your project files and code changes should update it automatically. 
- If you want to install the release version of Harvey again, unlink your local project by running `npm unlink .`, before doing so.