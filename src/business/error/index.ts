export class HarveyError extends Error {}
export class HarveyFileNotFoundError extends HarveyError {}

export function handleError(error: unknown): void {
  if (error instanceof HarveyError) {
    process.stdout.write(`${error.message}\n`);
  } else {
    throw error;
  }
}
