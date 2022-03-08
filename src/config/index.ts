import fs from 'fs';
import Harvest from 'node-harvest-api';
import { createInterface as createReadlineInterface } from 'readline';
import path from 'path';
import { transformPath } from '../helper';

export interface Config {
  accountId: string;
  accessToken: string;
  aliasFilePath: string;
  pausedTimerFilePath: string;
  fileParser: FileParserConfig;
  harvestSubdomain?: string;
}

export interface FileParserConfig {
  type: string;
  worksheet?: string;
  aliasColumn?: string;
  minutesColumn?: string;
}

const defaultConfig: Config = {
  accountId: '',
  accessToken: '',
  aliasFilePath: '~/.config/harvey/aliases.json',
  pausedTimerFilePath: '~/.config/harvey/paused_timer.json',
  fileParser: {
    type: 'xlsx',
    worksheet: 'Timebooking',
    aliasColumn: 'Link',
    minutesColumn: 'Minutes',
  },
};

export function configFileExists(filePath: string): boolean {
  filePath = transformPath(filePath);
  return fs.existsSync(filePath);
}

export async function testNewConfigsHarvestCreds(config: Config): Promise<boolean> {
  const harvest = new Harvest(config.accountId, config.accessToken, 'harvey');

  return new Promise((resolve) => {
    harvest.users.me().then((user: HarvestUser) => {
      if (user.first_name) {
        resolve(true);
      }
      resolve(false);
    });
  });
}

export async function initializeConfig(filePath: string): Promise<void> {
  const newConfig: Config = await askForConfigParameters();
  const configIsValid = await testNewConfigsHarvestCreds(newConfig);

  if (!configIsValid) {
    process.stdout.write('Could not authenticate, please try again.\n');

    await initializeConfig(filePath);
  }

  writeConfigFile(newConfig, filePath);
}

export function readConfigFile(filePath: string): Config {
  if (!configFileExists(filePath)) {
    throw new Error(`No config file found at ${filePath}. Please create one, by running the init command`);
  }
  filePath = transformPath(filePath);
  return JSON.parse(fs.readFileSync(filePath).toString());
}

function writeConfigFile(config: Config, filePath: string): void {
  filePath = transformPath(filePath);
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
  process.stdout.write(`Sucessfully generated config ${filePath}\n`);
}

async function askForConfigParameters(): Promise<Config> {
  return new Promise((resolve) => {
    const config: Config = defaultConfig;

    const rl = createReadlineInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Please enter your harvest account id: ', function (account_id: string) {
      config.accountId = account_id;
      rl.question('Please enter your personal access token: ', function (token: string) {
        config.accessToken = token;
        rl.close();
        resolve(config);
      });
    });
  });
}