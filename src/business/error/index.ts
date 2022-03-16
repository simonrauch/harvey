import { printMessage } from '../../cli/cli-output';

export class HarveyError extends Error {}
export class HarveyFileNotFoundError extends HarveyError {}

export function handleError(error: unknown): void {
  if (error instanceof HarveyError) {
    printMessage(`${error.message}`);
  } else {
    throw error;
  }
}
