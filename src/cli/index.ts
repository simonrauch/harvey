#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv)).commandDir('command').demandCommand().strict().alias({
  h: 'help',
}).argv;
