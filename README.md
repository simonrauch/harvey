[![npm](https://badgen.net/npm/v/@simonrauch/harvey/latest)](https://www.npmjs.com/package/@simonrauch/harvey) 
[![npm](https://badgen.net/npm/dt/@simonrauch/harvey)](https://www.npmjs.com/package/@simonrauch/harvey)

# Harvey

A small helper script for working with HCL Harvest bookings.

## Dependencies

This helper script is designed to make working with the Harvest cli tool [HCL](https://github.com/zenhob/hcl) a bit easier. So it's main dependency is HCL. 

The official HCL repository sadly seems to be abandoned and does not support the functionality to log entries on any other day than today. Therefore I recommend building HCL form source from this fork: [jferg-newcontext/hcl](https://github.com/jferg-newcontext/hcl)

## Installation

```
npm i -g @simonrauch/harvey
```

## Usage

### Add HCL alias


This command will search in all available Harvest tasks for a string. If it finds an unique task, it will set the string as an alias for the task. This can be helpful if you are using for example unique identifiers, like a Jira issue id.

```
harvey add <ALIAS>
```

#### Example
```
harvey add TEST-27
```

### Remove HCL alias

This command will remove an alias. 

```
harvey remove <ALIAS>
```

#### Example
```
harvey remove TEST-27
```

### Parse CSV

To parse a CSV file the file has to:

 - be semicolon delimited (`;`)
 - have the alias in the first column
 - have the time value as minutes in the last column

 The script will try to create all non existent aliases before actually adding new entries to harvest.

```
harvey parse <CSV-FILE> <DATE> <COMMENT> 
```

#### Example

```
TEST-23;blabla;ispum;15
TEST-22;blabla;ispum;75
TEST-29;blabla;ispum;30
TEST-201;blabla;ispum;120
```
```
harvey parse ~/sprintchange.csv "last thursday" "sprintchange"
```