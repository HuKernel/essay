const BUSY_RETRY_CODES = new Set(["EBUSY", "EPERM"]);
const BUSY_RETRY_DELAYS_MS = [30, 60, 120, 240, 480];

export async function renameWithBusyRetry<T>(
  rename: () => Promise<T>,
  sleep: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= BUSY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await rename();
    } catch (error) {
      lastError = error;
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt === BUSY_RETRY_DELAYS_MS.length || !BUSY_RETRY_CODES.has(code ?? "")) throw error;
      await sleep(BUSY_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}
