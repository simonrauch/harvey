export class HarveyError extends Error {}
export class HarveyFileNotFoundError extends HarveyError {}

export function handleError(error: unknown): void {
  error instanceof HarveyError
    ? process.stdout.write(`${error.message}\n`)
    : process.stdout.write(`Unhandled error: \n ${error}`);
}
