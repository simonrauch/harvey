import { createReadlineInterface } from '.';

export async function askForHarvestAccountId(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Please enter your harvest account id: ', (account_id) => {
      rl.close();
      resolve(account_id);
    });
  });
}

export async function askForPersonalAccessToken(): Promise<string> {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question('Please enter your personal access token: ', (token) => {
      rl.close();
      resolve(token);
    });
  });
}
