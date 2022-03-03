export class HarveyError extends Error {}

export function handleError(error: any): void {
  error instanceof HarveyError
    ? process.stdout.write(`${error.message}\n`)
    : process.stdout.write(`Unhandled error: \n ${error}`);
}
