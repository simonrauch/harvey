import { printMessage } from '../../cli/cli-output';
import { askForHarvestAccountId, askForPersonalAccessToken } from '../../cli/user-input/config';
import { isAccountIdAndTokenValid } from '../../service/api/harvest';
import { readConfigFile, writeConfigFile } from '../../service/filesystem/config';

export interface Config {
  accountId: string;
  accessToken: string;
  aliasFilePath: string;
  pausedTimerFilePath: string;
  defaultRoundingInterval: number;
  fileParser: FileParserConfig;
  harvestSubdomain?: string;
}

export class HarveyConfig {
  private static config: Config;
  private constructor() {
    throw new Error("Don't use the constructor of this class. Only use it's static methods.");
  }
  public static getConfig(): Config {
    if (!this.config) {
      throw new Error('Global config was never initialised.');
    }
    return this.config;
  }
  public static loadConfig(configFilePath: string): Config {
    this.config = readConfigFile(configFilePath);
    return this.config;
  }
  public static setConfig(config: Config): void {
    this.config = config;
  }
}

export interface FileParserConfig {
  type: string;
  worksheet?: string;
  aliasColumn?: string;
  minutesColumn?: string;
}

export const defaultConfig: Config = {
  accountId: '',
  accessToken: '',
  aliasFilePath: '~/.config/harvey/aliases.json',
  pausedTimerFilePath: '~/.config/harvey/paused_timer.json',
  defaultRoundingInterval: 15,
  fileParser: {
    type: 'xlsx',
    worksheet: 'Timebooking',
    aliasColumn: 'Link',
    minutesColumn: 'Minutes',
  },
};

export async function initializeConfig(filePath: string): Promise<void> {
  return new Promise((resolve) => {
    const newConfig = defaultConfig;
    askForHarvestAccountId().then((accountId) => {
      newConfig.accountId = accountId;
      askForPersonalAccessToken().then((token) => {
        newConfig.accessToken = token;
        isAccountIdAndTokenValid(newConfig.accountId, newConfig.accessToken).then((credentialsAreValid) => {
          if (credentialsAreValid) {
            writeConfigFile(newConfig, filePath);
            printMessage(`Sucessfully generated config "${filePath}".`);
            resolve();
          } else {
            printMessage('Could not authenticate, please try again.');
            initializeConfig(filePath).then(resolve);
          }
        });
      });
    });
  });
}
