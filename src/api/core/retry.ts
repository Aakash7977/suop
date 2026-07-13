/** Retry logic for transient failures */

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number; retryOn?: number[] } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, retryOn = [502, 503, 504] } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err
      const status = (err as { status?: number }).status
      if (attempt < maxRetries && status && retryOn.includes(status)) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
        continue
      }
      throw err
    }
  }
  throw lastError
}
