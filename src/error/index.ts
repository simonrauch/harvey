export function handleError(error: any): void {
    (error instanceof Error) ? process.stdout.write(`${error.message}\n`) : process.stdout.write(`Unhandled error: \n ${error}`)
}