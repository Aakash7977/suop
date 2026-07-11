/**
 * Error Handler Middleware (kept for reference — app.ts uses app.onError instead)
 */

import type { Context, Next } from 'hono'
import { toBaseError, getHttpStatus } from '@/core/errors'
import { logger } from '@/core/logging'

export async function errorHandlerMiddleware(_c: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err) {
    const baseError = toBaseError(err)
    const status = getHttpStatus(baseError)

    if (status >= 500) {
      logger.error('Unhandled error', {
        error: baseError.message,
        code: baseError.code,
        stack: baseError.stack,
      })
    } else if (status >= 400) {
      logger.warn('Client error', {
        error: baseError.message,
        code: baseError.code,
      })
    }

    // Re-throw to let Hono's app.onError handle the response
    throw baseError
  }
}
